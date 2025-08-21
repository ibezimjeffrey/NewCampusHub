import React, { useState, useEffect } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native-elements';
import { useSelector } from 'react-redux';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { firestoreDB } from '../config/firebase.config';
import { useFonts, Dosis_400Regular } from '@expo-google-fonts/dosis';
import { StyleSheet } from 'react-native';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const AllPostsscreen = ({route}) => {
    const { user } = route.params;
    const [Postings, setPostings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigation();
    useEffect(() => {
        const msgQuery = query(collection(firestoreDB, 'postings'));
        const unsubscribe = onSnapshot(msgQuery, (QuerySnapshot) => {
          const upMsg = QuerySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setPostings(upMsg.filter(post => post.User._id === user._id));
          setIsLoading(false);
        });
        return unsubscribe;
      }, [user._id]);
    
      const styles = StyleSheet.create({
        dosisText: {
          fontFamily: 'Dosis_400Regular',
          fontSize: 20,
        },
      });

      const PostingCard = ({ post }) => {
        const isCurrentUserPost = post.User._id === user._id;
    
        return (
          <View className="rounded-xl w-[350px] flex py-2">
            <TouchableOpacity onPress={() => navigate.navigate("DetailsScreen", { post })}>
            <BlurView style={{left:30}} className=" bg-slate-300 px-4 py-1 rounded-xl w-[350px] h-[150px] border-1 relative shadow " tint='extraLight' intensity={40} >
            <Image source={{ uri: post.User.profilePic }} resizeMode="cover" className="w-12 h-12 relative top-2" style={{ alignSelf:'flex-end' }} />
            <Text className="text-black text-2xl p-2 capitalize font-extralight absolute top-10">{post.JobDetails}</Text>
            <Text style={{ top: 20 }} className="text-gray-500 p-2 capitalize text-xl absolute">
              {post.Location}
            </Text>
            
            <Text className="text-primaryButton  capitalize font-thin text-xl absolute bottom-2 left-2">{post.Type}</Text>
            <Text className="text-black font-thin capitalize text-base absolute bottom-2 right-2">Fixed Price / ₦{post.Budget}</Text>
            </BlurView>
         

            </TouchableOpacity>
          </View>
        );
      };

    
  return (
    <SafeAreaView>

    
    <View>
        <ScrollView className="h-full"> 
        <TouchableOpacity onPress={() => navigate.goBack()}>
              <MaterialIcons name="chevron-left" size={32} color={"#000000"} />
            </TouchableOpacity>
        <View className="items-center">
            <Text className=" text-primaryButton text-xl">
              My Posts
            </Text>
          </View>

       
       {isLoading ? (
            <View className="w-full flex items-center justify-center">
              <ActivityIndicator size={'large'} color={'#268290'} />
            </View>
          ) : (
            <View>
              {Postings.length > 0 ? (
                Postings.map((post, i) => (
                  <PostingCard key={i} post={post} />
                ))
              ) : (
                <View className=" flex flex-column justify-center align-middle items-center">
                <Text>You have no jobs posted</Text>
                </View>
              )}
            </View>
          )}
           </ScrollView>
    </View>
    </SafeAreaView>
  )
}

export default AllPostsscreen