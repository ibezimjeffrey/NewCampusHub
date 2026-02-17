import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { firestoreDB } from '../config/firebase.config';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Dimensions } from 'react-native';
import FancyTextInput from '@/components/FancyTextInput';
import { SafeAreaView } from "react-native-safe-area-context";


const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');

const scaleFont = (baseFont) => {
  if (width <= 320) return baseFont * 0.8;   // very small phones
  if (width <= 375) return baseFont * 0.9;   // small phones
  return baseFont;                            // normal phones
};

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
    <SafeAreaView edges={['top']} style={{ flex: 1, padding: 20 }}>
      <View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
 
  <View>

    <View style={{ position: 'relative', width: '100%' }}>
  
  {/* Search Input */}
  <FancyTextInput
    style={{
      width: '100%',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 20,
      paddingLeft: 16,
      paddingRight: 44, // space for clear button
      height: 50,
    }}
    value={searchTerm}
    placeholder="Search job title"
    keyboardType="web-search"
    multiline={false}
    returnKeyType="search"
    onSubmitEditing={() => {
      if (searchTerm.trim()) {
        handleSearch();
      }
    }}
    onChangeText={setSearchTerm}
    onKeyPress={handleKeyPress}
  />

  {/* Clear Button */}
  {searchTerm.length > 0 && (
     <TouchableOpacity onPress={clearSearch}
      style={{
        position: 'absolute',
        right: 14,
        top: '50%',
        transform: [{ translateY: -12 }],
      }}
  >
    <MaterialIcons name='clear' size={30} color={'#268290'} />
  </TouchableOpacity>

  )}
</View>




  </View>
  


        </View>

        {searchPerformed && !isLoading && searchResults.length === 0 && (
          <View style={{top:height/2 - 100, position: "absolute", left:width/2 - 100}} >
            <Text className="italic font-extralight">No jobs available</Text>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color="#268290" />
        ) : searchResults.length > 0 ? (
          <ScrollView className="h-full">
            {searchResults.map((post, index) => (
              <View className="rounded-xl w-[350px] ml-3 center flex py-2 mt-5" key={index}>
                <TouchableOpacity style={{ width: width - 40 }} onPress={() => { navigation.navigate("DetailsScreen", { post }) }}>


               <View  style={{ width: width - 40, paddingVertical: 10 }} className=" bg-slate-200 px-4 py-1  rounded-xl h-[150px] border-1 relative shadow ">
     
            <Image source={{ uri: post.User.profilePic }} resizeMode="cover" className="w-12 h-12 relative top-2" style={{ alignSelf:'flex-end' }} />
            <Text
  style={{
    color: '#6b7280',              // gray-500
    fontSize: scaleFont(16),       // was text-xl
    padding: 8,
    textTransform: 'capitalize',
    position: 'absolute',
   marginTop: 70,
  }}
  numberOfLines={1}
  adjustsFontSizeToFit={true}
  minimumFontScale={0.75}
>
  {post.Location}
</Text>


           <Text
  style={{
    color: '#000',
    fontSize: 20,        // was text-2xl
    fontWeight: '200',
    padding: 8,
    textTransform: 'capitalize',
    position: 'absolute',
    top: 40,
  }}
  numberOfLines={2}                // prevents overflow
  adjustsFontSizeToFit={true}
  minimumFontScale={0.7}
>
  {post.JobDetails}
</Text>

            
           <View style={{ flex: 1, justifyContent: 'flex-end' }}>
  <View style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  }}>
    <Text
      style={{
        color: '#268290',
        fontWeight: '300',
        fontSize: scaleFont(16),
        flexShrink: 1, // allows shrinking on small screens
      }}
      numberOfLines={1} // prevents wrapping
    >
      {post.DisplayTime}
    </Text>

    <Text className='pr-3'
      style={{
        color: '#000',
        fontWeight: '300',
        fontSize: scaleFont(14),
        flexShrink: 1, // allows shrinking
        textAlign: 'right',
      }}
      numberOfLines={1}
    >
      Fixed Price / ₦{post.Budget}
    </Text>
  </View>
</View>

          </View>


                  
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
