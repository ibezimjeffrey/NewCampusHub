import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { NEW_LOGO } from '../assets';
import { Userinput } from '../components';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth, firestoreDB } from '../config/firebase.config';
import { doc, getDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { SET_USER } from '../context/actions/userActions';
import LoadingOverlay from './LoadingOverlay';

const Loginscreen = () => {
  const [isApplying, setIsApplying] = useState(false);
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [getEmailValidationStatus, setgetEmailValidationStatus] = useState(false);
  const [alert, setalert] = useState(false);
  const [alertMessage, setalertMessage] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const buttonMargin = new Animated.Value(20); // Default space below button

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (event) => {
      const kbHeight = event.endCoordinates.height;
      setKeyboardHeight(kbHeight);
      Animated.timing(buttonMargin, {
        toValue: kbHeight - 30, // Set exact space between button and keyboard
        duration: 200,
        useNativeDriver: false,
      }).start();
    });

    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
      Animated.timing(buttonMargin, {
        toValue: 20, // Reset margin when keyboard hides
        duration: 200,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const HandleLogin = async () => {
    setIsApplying(true);
    if (getEmailValidationStatus && email !== "") {
      try {
        const userCred = await signInWithEmailAndPassword(firebaseAuth, email, password);
        if (userCred) {
          await userCred.user.reload();
          console.log("User ID", userCred?.user.uid);
          const userDoc = await getDoc(doc(firestoreDB, 'users', userCred?.user.uid));
          if (userDoc.exists) {
            console.log("User Data", userDoc.data());
            dispatch(SET_USER(userDoc.data()));
          }
        }
      } catch (err) {
        console.log("Error: ", err.message);
        setIsApplying(false);
        setalert(true);
        if (err.message.includes("invalid-credential")) {
           Toast.show({
            type: ALERT_TYPE.WARNING,
            title: 'Invalid Credentials',
            textBody:'Check your email and password and try again.',
          });
        } else if (err.message.includes("network-request-failed")) {
          Toast.show({
            type: ALERT_TYPE.WARNING,
            title: 'Network Error',
            textBody:'Check your network connection.',
          });
        } else if (err.message.includes("user-not-found")) {
           Toast.show({
            type: ALERT_TYPE.WARNING,
            title: 'Invalid Credentials',
            textBody:'Check your email and password and try again.',
          });
        } else {
          Toast.show({
            type: ALERT_TYPE.WARNING,
            title: 'Invalid Credentials',
            textBody:'Check your email and password and try again.',
          });
        }
      } finally {
        setIsApplying(false);
      }
    } else {
      setIsApplying(false);
      Toast.show({
            type: ALERT_TYPE.WARNING,
            title: 'Invalid Credentials',
            textBody:'Check your email and password and try again.',
          })
      setTimeout(() => setalert(false), 2000);
    }
  };

  return (
    <KeyboardAvoidingView
  className="flex-1 bg-white"
  behavior={Platform.OS === "ios" ? "padding" : "padding"}
>
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View className="flex-1 items-center justify-center px-6">

      {/* Logo */}
      <Image
        source={NEW_LOGO}
        className="w-40 h-40 mb-6"
        resizeMode="contain"
      />

      {/* Create account row */}
     

      {/* Divider */}
      

      {/* Alert */}
      {alert && (
        <Text className="text-base text-red-500 mb-2">
          {alertMessage}
        </Text>
      )}

      {/* Inputs */}
      <View className="w-full space-y-3">
        <Userinput
          Placeholder="Email"
          isPass={false}
          setstateValue={setemail}
          setgetEmailValidationStatus={setgetEmailValidationStatus}
        />
        <Userinput
          Placeholder="Password"
          isPass={true}
          setstateValue={setpassword}
        />
      </View>

      {/* Button */}
      <Animated.View style={{ marginBottom: buttonMargin }} className="w-full mt-4">
        <TouchableOpacity
          disabled={isApplying}
          onPress={HandleLogin}
          className="rounded-xl bg-primaryButton py-3 items-center justify-center"
        >
          
            <Text className="text-white text-xl font-semibold">
              Sign in
            </Text>
        
        </TouchableOpacity>

        


      </Animated.View>
      <Text className="text-base font-extralight mb-2">Don't have an account?</Text>
    
{isApplying ? (
            <LoadingOverlay visible={true} />
          ) : (
            ""
          )}

      <Animated.View style={{ marginBottom: buttonMargin }} className="w-full mt-4">
        <TouchableOpacity
          disabled={isApplying}
         onPress={() => navigation.navigate("Signupscreen")}
          className="rounded-xl bg-white py-3 border border-primaryButton items-center justify-center"
        >
         
            <Text className="text-primaryButton text-xl font-semibold">
              Register
            </Text>
         
        </TouchableOpacity>
      </Animated.View>


    </View>
  </TouchableWithoutFeedback>
</KeyboardAvoidingView>

  );
};

export default Loginscreen;
