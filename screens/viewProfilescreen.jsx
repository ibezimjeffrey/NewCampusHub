import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'react-native-elements';
import { useSelector, useDispatch } from 'react-redux';
import { firebaseAuth, firestoreDB } from '../config/firebase.config';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useFonts, Dosis_200ExtraLight, Dosis_400Regular, Dosis_800ExtraBold } from '@expo-google-fonts/dosis';
import { MaterialIcons } from '@expo/vector-icons';

const ViewProfilescreen = ({ route }) => {
  const { post } = route.params;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [jobCount, setJobCount] = useState(0);
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [allHires, setAllHires] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [ImageWidth, setImageWidth] = useState(100)
  const [ImageHeight, setImageHeight] = useState(100)

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(firestoreDB, 'portfolio'), where('user._id', '==', post.user._id)), (querySnapshot) => {
      const images = querySnapshot.docs.map(doc => doc.data().image).flat();
      setPortfolioImages(images);
    });
    return unsubscribe;
  }, [post._id]);

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(firestoreDB, 'Status'), where('receipient._id', '==', post.user._id)), (querySnapshot) => {
      setAllHires(querySnapshot.docs.length);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [post._id]);

  const ViewImage = () => {
    setImageWidth(300);
    setImageHeight(300);

    setTimeout(() => {
      setImageWidth(100);  
      setImageHeight(100); 
    }, 5000); 
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(firestoreDB, 'AllPostings'), where('User._id', '==', post.user._id)), (querySnapshot) => {
      setJobCount(querySnapshot.docs.length);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [post.user._id]);

  useLayoutEffect(() => {
    const msgQuery = query(collection(firestoreDB, 'users', post.user._id, 'details'));
    const unsubscribe = onSnapshot(msgQuery, (querySnapshot) => {
      const upMsg = querySnapshot.docs.map((doc) => doc.data());
      setDetails(upMsg);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [post.user._id]);

  const [fontsLoaded] = useFonts({
    Dosis_200ExtraLight,
    Dosis_400Regular,
    Dosis_800ExtraBold,
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="p-4">
        <View className="flex-row items-center justify-between pt-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="chevron-left" size={32} color="#268290" />
          </TouchableOpacity>
        </View>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#268290" />
          </View>
        ) : (
          <>
            <View className="items-center mt-8">
              <View className="rounded-full p-1">
                <Image source={{ uri: post.user.profilePic }} resizeMode="cover" style={{ width: 100, height: 100 }} />
              </View>
              <Text className="text-2xl capitalize font-bold pt-4">{post.user.fullName}</Text>
              <Text className="text-base font-bold text-gray-500">{post.user.email}</Text>
            </View>
            <View className="flex-row justify-between mt-4">
              <View className="items-center">
                <Text className="text-2xl">{jobCount}</Text>
                <Text className="text-gray-500">Jobs posted</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl">{allHires}</Text>
                <Text className="text-gray-500">Hires</Text>
              </View>
            </View>
            <View className="mt-4">
              <Text className="text-base text-gray-500">Course of study: <Text className="text-base font-bold">{details.length > 0 ? details[0].Hostel : 'No course'}</Text></Text>
            </View>

            <View className="mt-2">
            <Text className="mt-5 font-semibold">About {post.user.fullName}</Text>

            </View>

            <View className="mt-4">
              <Text className="text-base font-thin">{details.length > 0 ? details[0].About : 'No bio'}</Text>
            </View>
            <View className="mt-4" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {details.length > 0 && typeof details[0].Skills === 'string' && details[0].Skills.length > 0 && (
                details[0].Skills.split(', ').map((skill, index) => (
                  <View key={index} style={{ borderColor: "#268290", borderWidth: 1, borderRadius: 20, padding: 8, margin: 4 }}>
                    <Text className="capitalize">{skill}</Text>
                  </View>
                ))
              )}
            </View>
            <View className="w-full flex-row items-center">
              <Text className="mt-5 font-semibold">Portfolio</Text>
            </View>
            <View className="left-6" style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
              {details.length > 0 && details[0].images && Array.isArray(details[0].images) && details[0].images.length > 0 && details[0].images.map((imageUri, index) => (
                <TouchableOpacity onPress={ViewImage}>
                <Image
                  className="border-2 rounded-3xl border-primaryButton"
                  key={index}
                  resizeMode="cover"
                  style={{ width: ImageWidth, height: ImageHeight, margin: 5 }}
                  source={{ uri: imageUri }}
                />
                </TouchableOpacity>

              ))}
              {portfolioImages.length > 0 && portfolioImages.map((imageUri, index) => (
                <TouchableOpacity onPress={ViewImage}>
                <Image
                  className="border-2 rounded-3xl border-primaryButton"
                  key={index}
                  resizeMode="cover"
                  style={{ width: ImageWidth, height: ImageWidth, margin: 5 }}
                  source={{ uri: imageUri }}
                />
                </TouchableOpacity>
              ))}
              {details.length === 0 && portfolioImages.length === 0 && (
                <View className='right-5 w-full justify-center items-center'>
                  <Text className="italic font-extralight">Nothing on portfolio</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewProfilescreen;
