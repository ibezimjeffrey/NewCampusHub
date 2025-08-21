import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image, SafeAreaView } from 'react-native';
import { firestoreDB } from '../config/firebase.config';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

const Searchscreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const clearSearch = () => {
    setSearchTerm('');
    setIsLoading(false);
    setSearchResults([]);
    setSearchPerformed(false);
  };

  const handleSearch = () => {
    setIsLoading(true);
    setSearchPerformed(true);
    const msgQuery = query(collection(firestoreDB, 'postings'));
    onSnapshot(msgQuery, (QuerySnapshot) => {
      const postings = QuerySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id, 
      }));
      const filteredPostings = postings.filter((post) =>
        post.JobDetails.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filteredPostings);
      setIsLoading(false);
    });
  };

  const handleKeyPress = (e) => {
    // Check if backspace key is pressed and searchTerm is empt
    if (e.nativeEvent.key === 'Backspace' && searchTerm === '') {
      clearSearch(); 
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <View style={{ flex: 1 }}>
    <View className="w-[325px] top-4 left-4" style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, padding: 10 }}>
      <Entypo name='magnifying-glass' size={24} style={{ marginRight: 10 }} />
      <TextInput
        style={{ flex: 1 }}
        placeholder="Search job title"
        value={searchTerm}
        keyboardType='web-search'
        onSubmitEditing={() => {
          if (searchTerm.trim() !== '') {
            handleSearch();
          }
        }}
        onChangeText={(text) => setSearchTerm(text)}
        onKeyPress={handleKeyPress}
      />
    </View>
  </View>
  <View className=" right-3 top-3">
  <TouchableOpacity onPress={clearSearch}>
    <Text className="text-xl" style={{ color: '#268290' }}>Clear</Text>
  </TouchableOpacity>

  </View>
  


        </View>

        {searchPerformed && !isLoading && searchResults.length === 0 && (
          <View style={{top:300, left:150}} >
            <Text className="italic font-extralight">No jobs available</Text>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color="#268290" />
        ) : searchResults.length > 0 ? (
          <ScrollView className="h-full">
            {searchResults.map((post, index) => (
              <View className="rounded-xl w-[350px] flex py-2 top-5" key={index}>
                <TouchableOpacity onPress={() => { navigation.navigate("DetailsScreen", { post }) }}>
                  <BlurView style={{ left: 30 }} className=" bg-slate-300 px-4 py-1 rounded-xl w-[350px] h-[150px] border-1 relative shadow " tint='extraLight' intensity={40} >
                    <Image source={{ uri: post.User.profilePic }} resizeMode="cover" className="w-12 h-12 relative top-2" style={{ alignSelf: 'flex-end' }} />
                    <Text className="text-black text-2xl p-2 capitalize font-serif absolute top-10">{post.JobDetails}</Text>
                    <Text style={{ top: 20 }} className="text-gray-500 p-2 capitalize text-xl absolute">
                      {post.Location}
                    </Text>

                    <Text className="text-primaryButton  capitalize font-thin text-xl absolute bottom-2 left-2">{post.Type}</Text>
                    <Text className="text-black font-thin capitalize text-base absolute bottom-2 right-2">Fixed Price / ₦{post.Budget}</Text>
                  </BlurView>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default Searchscreen;
