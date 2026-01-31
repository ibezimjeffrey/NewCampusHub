import React, { useState } from 'react';
import { View, Text, Image, Dimensions, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { BGImage, Logo } from '../assets';
import { SafeAreaView } from 'react-native-safe-area-context';
import Userinput from '../components/Userinput'; // Correct import statement
import { useNavigation } from '@react-navigation/native';
import { avatars } from '../utils/support';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth, firestoreDB } from '../config/firebase.config';
import { doc, setDoc } from 'firebase/firestore';
import {sendEmailVerification} from 'firebase/auth';
import { StyleSheet } from "react-native";
import { FlatList } from "react-native";
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';


const Signupscreen = () => {
  const screenwidth = Math.round(Dimensions.get("window").width);
  const screenHeight = Math.round(Dimensions.get("window").height);
  const [avatar, setavatar] = useState(avatars[0]?.image.asset.url);
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [name, setname] = useState("");
  const [AVATARmenu, setAVATARmenu] = useState(false);
  const [getEmailValidationStatus, setgetEmailValidationStatus] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  const HandleAVATAR = (item) => {
    setavatar(item?.image?.asset?.url);
    setAVATARmenu(false);
  };

  const checkPasswordStrength = (password) => {
    if (password.length >= 8) {
      setPasswordStrength('Strong');
    } else if (password.length >= 6) {
      setPasswordStrength('Medium');
    } else {
      setPasswordStrength('Weak');
    }
  };


  const handleSignup = async () => {
    setIsApplying(true);
    if (!name.trim() || !email.trim()) {
      setIsApplying(false);
           Toast.show({
                        type: ALERT_TYPE.WARNING,
                        title: 'Incomplete Details',
                        textBody:'Please fill in all details',
                      });
      return;
    }

    if (passwordStrength === "Weak") {
      setIsApplying(false);
           Toast.show({
                        type: ALERT_TYPE.WARNING,
                        title: 'Weak Password',
                        textBody:' Please choose a stronger password with at least 8 characters.',
                      });
      return;
    }

    if (getEmailValidationStatus === false) {
      setIsApplying(false);
           Toast.show({
                        type: ALERT_TYPE.WARNING,
                        title: 'Invalid Email Address',
                        textBody:' Please enter a valid email address.',
                      });
      return;
    }
    
    if (getEmailValidationStatus && email !== "") {
      try {
        const userCred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const data = {
          _id: userCred?.user.uid,
          fullName: name,
          profilePic: avatar,
          email: email,
          providerData: userCred.user.providerData,
        };

        await setDoc(doc(firestoreDB, "users", userCred?.user.uid), data);
        await sendEmailVerification(userCred.user)

        navigation.replace("Aboutscreen");
      } catch (error) {
        setIsApplying(false);
             Toast.show({
                          type: ALERT_TYPE.WARNING,
                          title: 'Email already in use',
                          textBody:' Please use a different email address.',
                        });

        if(error ==="Failed to get document because the client is offline.")
               Toast.show({
                            type: ALERT_TYPE.WARNING,
                            title: 'No Internet Connection',
                            textBody:' Please check your internet connection and try again.',
                          });

      }
    }
  };
const NUM_COLUMNS = 3;
const ITEM_SIZE = screenwidth / NUM_COLUMNS - 24;

  const navigation = useNavigation();
  return (
    <View className='flex-1 items-center justify-start'>
    <KeyboardAvoidingView
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  style={{ flex: 1 }}
>

   {AVATARmenu && (
  <View
    style={[
      StyleSheet.absoluteFillObject,
      {
        zIndex: 20,
        width: screenwidth,
        height: screenHeight,
      },
    ]}
  >
    {/* iOS REAL BLUR */}
    {Platform.OS === "ios" && (
      <BlurView
        tint="light"
        intensity={50}
        style={StyleSheet.absoluteFillObject}
      />
    )}

    {/* ANDROID FAKE BLUR */}
    {Platform.OS === "android" && (
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: "rgba(255,255,255,0.85)",
          },
        ]}
      />
    )}

  
       <FlatList
    data={avatars}
    keyExtractor={(item) => item._id}
    numColumns={NUM_COLUMNS}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{
      paddingVertical: 64,
      paddingHorizontal: 12,
      paddingBottom: 120,
    }}
    renderItem={({ item }) => (
      <TouchableOpacity
        onPress={() => HandleAVATAR(item)}
        style={{
          width: ITEM_SIZE,
          height: ITEM_SIZE,
          margin: 8,
          borderRadius: ITEM_SIZE / 2,
          borderWidth: 2,
          alignItems: "center",
          justifyContent: "center",
        }}
        className="border-primaryButton"
      >
        <Image
          source={{ uri: item?.image?.asset?.url }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: ITEM_SIZE / 2,
          }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    )}
  />

  
  </View>
)}


  <ScrollView
    className="h-full"
    style={{ backgroundColor: 'white' }}
    keyboardShouldPersistTaps="handled"
    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
  >

          <Image source={BGImage} resizeMode='cover' className='h-20' style={{ width: screenwidth }} />

        


          <View className='w-full h-full bg-white relative flex items-center justify-start py-6 px-6 space-y-6'>
            <View className="w-full flex items-center justify-center relative -my-4">
              <TouchableOpacity onPress={() => setAVATARmenu(true)}
                className="w-20 h-20 p-1 rounded-full border-2 border-primaryButton relative">
                <Image source={{ uri: avatar }} className="w-full h-full" resizeMode="contain" />
                <View className="w-6 h-6 bg-primaryButton rounded-full absolute top-0 right-0 flex items-center justify-center">
                  <MaterialIcons name='edit' size={10} color={'#fff'} />
                </View>
              </TouchableOpacity>
            </View>

            <View className="w-full flex items-center justify-center">
              <Userinput
                Placeholder="Full Name"
                isPass={false}
                setstateValue={setname}
              />
              <Userinput
                Placeholder="Email"
                isPass={false}
                setstateValue={setemail}
                setgetEmailValidationStatus={setgetEmailValidationStatus}
              />
              <Userinput
                Placeholder="Password"
                isPass={true}
                setstateValue={(value) => {
                  setpassword(value);
                  checkPasswordStrength(value);
                }}
              />
              {password !== "" && passwordStrength && <Text>Password Strength: {passwordStrength}</Text>}
              <TouchableOpacity disabled={isApplying} onPress={handleSignup}
               className="rounded-xl px-12  bg-primaryButton mt-2 flex items-center justify-center">
                {isApplying ? (
            <ActivityIndicator className="py-3" size="small" color="#ffffff" />
          ) : (
            <Text className='py-2 text-white text-xl font-semibold'>Next</Text>
          )}
              </TouchableOpacity>
              <View className="w-full flex-row py-2 justify-center space-x-2">
                <Text className="text-base font-thin text-primaryText">Have an Account?</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate("Loginscreen")}>
                <Text className="text-base font-semibold text-primaryButton">Login here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Signupscreen;