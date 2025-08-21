import { View, Text, ActivityIndicator, Image, Alert } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { Logo } from '../assets';
import { firebaseAuth, firestoreDB } from '../config/firebase.config';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { SET_USER } from '../context/actions/userActions';
import { useDispatch } from 'react-redux';

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
                    alert("Verify your email address");
                    
                } else {
                    navigation.replace("Homescreen");
                }
            } 
            
            else {
                setTimeout(() => {
                    navigation.replace("Loginscreen");
                }, 2000);
            }
        });
    };

    return (
        <View className="flex-1 bg-white items-center justify-center space-y-24">
            <Image source={Logo} className="w-24 h-24" resizeMode="contain" />
            <ActivityIndicator size={"large"} color={"#268290"} />
        </View>
    );
};

export default Splashscreen;
