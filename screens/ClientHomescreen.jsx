import React, { useState, useEffect } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native-elements';
import { useSelector } from 'react-redux';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { firestoreDB } from '../config/firebase.config';
import { useFonts, Dosis_400Regular } from '@expo-google-fonts/dosis';
import { StyleSheet } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const ClientHomescreen = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigation();

  const [greeting, setGreeting] = useState('');
  const [Postings, setPostings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const date = new Date();
    const hours = date.getHours();
    let greetingMessage = '';
    if (hours >= 5 && hours < 12) {
      greetingMessage = '  Good morning, ';
    } else if (hours >= 12 && hours < 18) {
      greetingMessage = '  Good afternoon, ';
    } else {
      greetingMessage = '  Good evening, ';
    }
    setGreeting(greetingMessage);
  }, []);

  useEffect(() => {
    const msgQuery = query(collection(firestoreDB, 'postings'));
    const unsubscribe = onSnapshot(msgQuery, (QuerySnapshot) => {
      const upMsg = QuerySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPostings(upMsg);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const styles = StyleSheet.create({
    dosisText: {
      fontFamily: 'Dosis_400Regular',
      fontSize: 20,
    },
  });

  

  const PostingCard = ({ post }) => {
    const isCurrentUserPost = post.User._id === user._id;

    return (
      <View className="rounded-2xl w-[350px] flex py-2">
        <TouchableOpacity onPress={() => navigate.navigate("DetailsScreen", { post })}>
          


          <View style={{ left: 30}} className=" bg-slate-200 px-4 py-1  rounded-xl w-[350px] h-[150px] border-1 relative shadow ">
     
            <Image source={{ uri: post.User.profilePic }} resizeMode="cover" className="w-12 h-12 relative top-2" style={{ alignSelf:'flex-end' }} />
            <Text className="text-black text-2xl p-2 capitalize font-extralight absolute top-10">{post.JobDetails}</Text>
            <Text style={{ top: 20 }} className="text-gray-500 p-2 capitalize text-xl absolute">
              {post.Location}
            </Text>
            
            <Text className="text-primaryButton  capitalize font-thin text-xl absolute bottom-2 left-2">{post.Type}</Text>
            <Text className="text-black font-thin capitalize text-base absolute bottom-2 right-2">Fixed Price / ₦{post.Budget}</Text>
    
         


          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="Flex-1 bg-white">
      <SafeAreaView>
        <ScrollView className="h-full">
          <View>
            <Text className=" text-black text-xl font-thin">
              {greeting}
              <Text className="text-2xl capitalize text-primaryButton">{user?.fullName}</Text>
            </Text>
          </View>

          <View className="flex-row flex justify-between items-end">

          <View >
            <Text className="text-2xl p-2 font-thin text-black"> </Text>
          </View>

      
        <View className=" right-7">
            <Text className="text-1xl text-blue-300 italic">Available Jobs</Text>
          </View>

     
         


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
                <Text>No jobs available</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default ClientHomescreen;
