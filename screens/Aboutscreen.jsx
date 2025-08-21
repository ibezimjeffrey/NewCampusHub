import { View, Text, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection, doc } from 'firebase/firestore';
import { firebaseAuth, firestoreDB } from '../config/firebase.config';
import { useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dmtgcnjxv/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'umdj7bkg';

const Aboutscreen = () => {
  const [isApplying, setIsApplying] = useState(false);
  const [value, setValue] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [value1, setValue1] = useState("");
  const [stateValue1, setStateValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [stateValue2, setStateValue2] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false); // New state for tracking image upload
  const navigation = useNavigation();
  const user = useSelector((state) => state.user.user);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        await user.reload();
        setIsEmailVerified(user.emailVerified);

        const verificationListener = setInterval(async () => {
          await user.reload();
          setIsEmailVerified(user.emailVerified);
          if (user.emailVerified) {
            clearInterval(verificationListener);
          }
        }, 5000);

        return () => clearInterval(verificationListener);
      } else {
        setIsEmailVerified(false);
      }
    });

    return unsubscribe;
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access the camera roll is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      try {
        setIsUploading(true); // Start uploading
        const response = await fetch(CLOUDINARY_URL, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const responseData = await response.json();
        const imageUrl = responseData.secure_url;
        setSelectedImages((prevImages) => [...prevImages, imageUrl]);
        alert('Image successfully uploaded');
      } catch (error) {
        console.error('Upload Error: ', error);
        alert('Image upload failed');
      } finally {
        setIsUploading(false); // End uploading
      }
    } else {
      console.log('Image selection canceled');
    }
  };

  const handleTextChange = (text) => {
    setValue(text);
    setStateValue(text);
  };

  const handleTextChange1 = (text) => {
    setValue1(text);
    setStateValue1(text);
  };

  const handleTextChange2 = (text) => {
    setValue2(text);
    setStateValue2(text);
  };

  let wordCount = value1.trim().split(/\s+/).filter(word => word.length > 0).length;
  let wordCount1 = value.trim().split(/\s+/).filter(word => word.length > 0).length;
  let wordCount2 = value2.trim().split(/\s+/).filter(word => word.length > 0).length;

  const handleAbout = async () => {
    setIsApplying(true);

    if (!value.trim() || !value1.trim() ) {
      alert('Please fill in all details');
      setIsApplying(false);
      return;
    }

    if (wordCount < 15) {
      alert('Minimum of 15 words');
      setIsApplying(false);
      return;
    }

    if (!isEmailVerified) {
      alert('Please verify your email address first.');
      setIsApplying(false);
      return;
    }

    const skillsArray = value2.trim().split(',').map(skill => skill.trim());

    const _doc = {
      _id: user._id,
      Hostel: value,
      About: value1,
      Skills: skillsArray.join(', '),
      images: selectedImages
    };

    try {
      await addDoc(collection(doc(firestoreDB, "users", user._id), "details"), _doc);
      navigation.navigate("Homescreen"); 
    } catch (err) {
      alert(err.message);
    }
    setIsApplying(false);
  };

  return (
    <SafeAreaView className="h-full bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="h-full">
          <View className="w-full h-full bg-white flex  justify-start py-6 space-y-6">
            <Text className="py-2 text-primaryText text-xl font-semibold">Let's get to know you</Text>

            <Picker
              className="left-5"
              selectedValue={value}
              onValueChange={(itemValue) => handleTextChange(itemValue)}
              style={{
                borderWidth: 1,
                borderColor: value.length > 0 ? "#268290" : "gray",
                borderRadius: 20,
                paddingHorizontal: 18,
                width: 360,
                left: 20
              }}
            >
              <Picker.Item label="Course" value="" />
              <Picker.Item label="Mass Communication" value="Mass Communication" />
              <Picker.Item label="ISMS" value="ISMS" />
              <Picker.Item label="Mechanical Engineering" value="Mechanical Engineering" />
              <Picker.Item label="Business Administration" value="Business Administration" />
              <Picker.Item label="Computer Science" value="Computer Science" />
              <Picker.Item label="Electrical Engineering" value="Electrical Engineering" />
              <Picker.Item label="Economics" value="Economics" />
              <Picker.Item label="Software Engineering" value="Software Engineering" />
              <Picker.Item label="Finance" value="Finance" />
              <Picker.Item label="Accounting" value="Accounting" />
            </Picker>

            <Text className="left-5 text-base">Tell us about yourself</Text>
            <TextInput
              className={`border rounded-2xl w-[360px] h-[215px] px-4 py-9 flex-row items-center justify-between space-x-8 left-5 my-2 `}
              placeholder="(minimum of 15 words)"
              onChangeText={handleTextChange1}
              value={value1}
              multiline={true}
            />
            <Text className="left-5 text-base">What are your skills</Text>
            <TextInput
              className={`border rounded-2xl w-[360px]  px-4 py-9 flex-row items-center justify-between space-x-8 left-5 my-2 `}
              placeholder="Coding, Graphic Design...(Optional)"
              onChangeText={handleTextChange2}
              value={value2}
              multiline={true}
            />

            <TouchableOpacity
              style={{
                width: 200,
                height: 200,
                borderColor: '#268290',
                borderWidth: 2,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 10,
                backgroundColor: '#fff',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
                elevation: 5,
              }}
              className="self-center"
              onPress={pickImage}
            >
              <View>
                <Text style={{ color: '#268290', textAlign: 'center', marginBottom: 10 }} className="text-base">
                  Upload Images of your work
                </Text>
                {isUploading && <ActivityIndicator size="large" color="#268290" />}
              </View>
            </TouchableOpacity>

            <View className="left-5 flex-row flex-wrap">
              {selectedImages.map((imageUri, index) => (
                <Image key={index} resizeMode="cover" style={{ width: 100, height: 100, margin: 5 }} source={{ uri: imageUri }} />
              ))}
            </View>

            <TouchableOpacity
              onPress={handleAbout}
              className="w-full px-4 rounded-xl bg-primaryButton my-3 flex items-center justify-center">
              {isApplying ? (
                <ActivityIndicator className="py-3" size="small" color="#ffffff" />
              ) : (
                <Text className='py-2 text-white text-xl font-semibold'>Ready to work!</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Aboutscreen;
