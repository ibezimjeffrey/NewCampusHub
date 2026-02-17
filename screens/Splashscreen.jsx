import { View, Text, ActivityIndicator, Image, Alert } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { NEW_LOGO} from '../assets';
import { firebaseAuth, firestoreDB } from '../config/firebase.config';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { SET_USER } from '../context/actions/userActions';
import { useDispatch } from 'react-redux';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

const Splashscreen = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    useLayoutEffect(() => {
        checkLoggedUser();
    }, []);

    const checkLoggedUser = async () => {
        firebaseAuth.onAuthStateChanged(async (user) => {
            if (user?.uid) {
                const userDoc = await getDoc(doc(firestoreDB, 'users', user.uid));
                if (userDoc.exists) {
                    console.log("User Data", userDoc.data());
                    dispatch(SET_USER(userDoc.data()));
                }

                if (!user.emailVerified) {
                    Toast.show({
                              type: ALERT_TYPE.WARNING,
                              title: 'Email Not Verified',
                              textBody:' Please verify your email before proceeding.',
                            });
                    
                } else {
                    navigation.replace("Homescreen");
                }
            } 
            
            else {
                setTimeout(() => {
                    navigation.replace("LandingPage");
                }, 2000);
            }
        });
    };

    return (
        <View className="flex-1 bg-white items-center justify-center space-y-24">
            <Image source={NEW_LOGO} className="w-24 h-24" resizeMode="contain" />
            <ActivityIndicator size={"large"} color={"#268290"} />
        </View>
    );
};

export default Splashscreen;
