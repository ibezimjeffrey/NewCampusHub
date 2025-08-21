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
import { Logo } from '../assets';
import { Userinput } from '../components';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth, firestoreDB } from '../config/firebase.config';
import { doc, getDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { SET_USER } from '../context/actions/userActions';

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
          setalertMessage("Wrong credentials");
        } else if (err.message.includes("network-request-failed")) {
          setalertMessage("Check Internet Connection");
          setTimeout(() => setalert(false), 9000);
        } else if (err.message.includes("user-not-found")) {
          setalertMessage("User not found");
          setTimeout(() => setalert(false), 2000);
        } else {
          setalertMessage("Invalid Email Address");
          setTimeout(() => setalert(false), 2000);
        }
      } finally {
        setIsApplying(false);
      }
    } else {
      setIsApplying(false);
      setalert(true);
      setalertMessage("Please enter a valid email.");
      setTimeout(() => setalert(false), 2000);
    }
  };

  return (
    <KeyboardAvoidingView
    className="bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 items-center justify-center px-6">
          <Image source={Logo} className="w-16 h-16 bottom-11 mb-11" resizeMode="contain" />

          <View className="w-full flex-row bottom-10 justify-center space-x-2">
            <Text className="text-base font-thin  text-primaryText">Don't have an Account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signupscreen")}>
              <Text className="text-base font-semibold text-primaryButton">Create Account</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-base bottom-6 font-extralight mt-2">Or</Text>
          <Text className="text-lg font-bold mb-4">Sign in</Text>

          {alert && <Text className="text-base text-red-500 mb-2">{alertMessage}</Text>}

          <Userinput
            Placeholder="Email"
            isPass={false}
            setstateValue={setemail}
            setgetEmailValidationStatus={setgetEmailValidationStatus}
          />
          <Userinput Placeholder="Password" isPass={true} setstateValue={setpassword} />

          <Animated.View style={{ marginBottom: buttonMargin }}>
            <TouchableOpacity

              disabled={isApplying}
      
              onPress={HandleLogin}
              
              className="rounded-xl px-12  bg-primaryButton mt-2 flex items-center justify-center"
            >
              {isApplying ? (
                <ActivityIndicator className="py-2" size="small" color="#ffffff" />
              ) : (
                <Text className="py-2 text-white text-xl font-semibold">Sign in</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Loginscreen;
