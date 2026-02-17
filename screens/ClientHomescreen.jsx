import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native-elements';
import { useSelector } from 'react-redux';
import { collection, query, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { firestoreDB } from '../config/firebase.config';
import { useFonts, Dosis_400Regular } from '@expo-google-fonts/dosis';
import { StyleSheet } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Dimensions } from 'react-native';
import { NEW_LOGO } from '@/assets';


const { width } = Dimensions.get('window');
const scaleFont = (baseFont) => {
  if (width <= 320) return baseFont * 0.8;   // very small phones
  if (width <= 375) return baseFont * 0.9;   // small phones
  return baseFont;                            // normal phones
};

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
const msgQuery = query(
  collection(firestoreDB, 'postings'),
  orderBy('createdAt', 'desc')
);

   
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
     <View style={{ width: '100%', alignItems: 'center', marginVertical: 10 }}
 className="rounded-2xl">
        <TouchableOpacity onPress={() => navigate.navigate("DetailsScreen", { post })}>
          


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

    <Text
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
    );
  };

  return (
  <View className="flex-1 bg-white">
  <SafeAreaView  edges={['top']} style={{ flex: 1 }}>
    <ScrollView
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      
    >
<View className='items-center mb-5'>
 <Image source={NEW_LOGO} className="w-24 h-24" resizeMode="contain" />

</View>
     
          <View>
  <Text style={{ color: '#000', fontSize: scaleFont(18), fontWeight: '300' }}>
    {greeting}
    <Text style={{ color: '#268290', fontSize: scaleFont(22), fontWeight: '400', textTransform: 'capitalize' }}>
      {user?.fullName}
    </Text>
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
               Postings
  .filter((post) => {
    const userEmailDomain = user?.email?.split('@')[1];
    const postEmailDomain = post?.User?.email?.split('@')[1];
    return userEmailDomain && postEmailDomain && userEmailDomain === postEmailDomain;
  })
  .map((post, i) => (
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
