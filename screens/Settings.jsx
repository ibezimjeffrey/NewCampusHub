import { View, Text, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { firebaseAuth, firestoreDB } from '../config/firebase.config';
import { useDispatch, useSelector } from 'react-redux';
import { collection, query, where, getDocs, getDoc, setDoc, doc } from 'firebase/firestore'; 
import { Paystack } from 'react-native-paystack-webview';
import axios from 'axios';

import { SET_USERMediaTypeOptions } from '../context/actions/userActions';

const Settings = () => {
  const user = useSelector((state) => state.user.user);
  const [details, setDetails] = useState('');
  const [start, setstart] = useState(false);
  const [value4, setvalue4] = useState(""); 
  const [Balance, setBalance] = useState(0);
  const [Payed, setPayed] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [add, setadd] = useState(false);
  const [number, setnumber] = useState(""); 
  const navigation = useNavigation();
  const dispatch = useDispatch();
   
  const handleTextChange4 = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    const formattedText = numericText ? Number(numericText).toLocaleString() : '';
    setvalue4(formattedText);
    const amountInKobo = numericText ? parseFloat(numericText) : 0;
    setnumber(amountInKobo);
  };

  const CancelEdit = () => {
    setadd(false);
    setnumber("");
  };

  const Begin = () => {
    setadd(true);
  };

  const Begin1 = async () => {  
    setstart(true)
  };

  useEffect(() => {
    const getUserBalance = async () => {
      try {
        const balanceDocRef = doc(firestoreDB, 'Balance', user._id);
        const balanceDocSnapshot = await getDoc(balanceDocRef);
  
        if (balanceDocSnapshot.exists()) {
          const existingBalance = parseFloat(balanceDocSnapshot.data().Amount);
          setBalance(existingBalance);
        } else {
          const totalBalance = await calculateTotalFromStatus();
          await setDoc(balanceDocRef, { Amount: totalBalance, id: user._id });
          setBalance(totalBalance);
        }
      } catch (error) {
        console.error("Error fetching initial balance: ", error);
      }
    };
  
    const calculateTotalFromStatus = async () => {
      try {
        const balancesQuery = query(
          collection(firestoreDB, 'Status'),
          where('receipient._id', '==', user._id)
        );
  
        const querySnapshot = await getDocs(balancesQuery);
        let totalBalance = 0;
  
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const cleanedPrice = data.price.replace(/,/g, '');
          if (cleanedPrice) {
            totalBalance += parseFloat(cleanedPrice);
          }
        });
  
        return totalBalance;
      } catch (error) {
        console.error("Error calculating balance from status: ", error);
        return 0;
      }
    };
  
    getUserBalance();
  }, [user._id]); 
  

  const onPaymentSuccess = async (amount) => {
    const newBalance = Balance + amount;
    try {
      const balanceDocRef = doc(firestoreDB, 'Balance', user._id);
      await setDoc(balanceDocRef, { Amount: newBalance });
      setBalance(newBalance);
      console.log("Balance updated successfully in Firestore!");
    } catch (error) {
      console.error("Error updating balance in Firestore: ", error);
    }
  };

  // call your backend to withdraw:
  const withdrawFunds = async () => {

    try {
      const res = await axios.post(
        // while testing on Expo Go, use your laptop IP + port
        'http://172.18.20.140:3000/withdraw', // <--- replace with your LAN IP or live URL
        {
          userId: user._id,
          amount: 1000,  // amount in Naira
          accountNumber: '1896201614', // test account number
          bankCode: '044',             // test bank code
          name: user.fullName
        },
        {
          headers: {
            'x-api-key': '3a7f9b2d-87f4-4c7a-b88d-9c63f07e6d12'
          }
        }
      );
      console.log('Withdraw response:', res.data);

    } catch (err) {
      console.error('Withdraw error:', err);
    }
  };

  const logout = async () => {
    await firebaseAuth.signOut().then(() => {
      setIsApplying(true);
  
      navigation.replace('Loginscreen');
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <SafeAreaView>
        <ScrollView className="h-full" style={{ paddingHorizontal: 10, paddingTop: 10 }}>
          <View className="flex-row justify-end pt-4">
            <TouchableOpacity onPress={logout}>
              {isApplying ? (
                <ActivityIndicator className="py-3 w-8 h-12" size="large" color="#268290" />
              ) : (
                <Text style={{ color: "#268290" }} className="font-bold text-lg">Logout</Text>
              )}
            </TouchableOpacity>
          </View>
          <View className="h-full">
            <View className="right-6" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 10 }}>
              <TouchableOpacity onPress={() => navigation.goBack()} className="absolute left-4">
                <MaterialIcons name='chevron-left' size={32} color={"#268290"} />
              </TouchableOpacity>
            </View>

            <View className="items-center mt-8">
              <Text className="text-3xl font-bold pt-4">
                N{Balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text className="text-base font-bold text-gray-500">Available Balance</Text>
            </View>

            <View className="justify-center items-center">
              <View className="border-primaryButton border rounded-xl mt-2" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, backgroundColor: "#FFFFFF", paddingHorizontal: 90 }}>
                <View>
                  <TouchableOpacity onPress={Begin} className="left-2 w-11 h-11 border border-primaryButton rounded-full flex items-center justify-center">
                    <MaterialIcons name='add' size={26} color={'#268290'} />
                  </TouchableOpacity>
                  <Text className="left-4 top-1 font-extrlight">Add</Text>
                </View>
                <View>
                  <TouchableOpacity onPress={withdrawFunds} className="left-2 w-11 h-11 border border-primaryButton rounded-full flex items-center justify-center">
                    <MaterialIcons name='arrow-downward' size={26} color={'#268290'} />
                  </TouchableOpacity>
                  <Text className="left-4 top-1 font-extrlight">Withdraw</Text>
                </View>
              </View>

              {start && (
                <Paystack  
                  paystackKey="pk_test_bb056f19149cb6867f38cb9019f7f94defd87bc0"  
                  amount={number} 
                  billingEmail={user.email} 
                  onCancel={(e) => {
                    console.log("Transaction canceled:", e);
                    setstart(false);
                  }}
                  onSuccess={async (res) => {
                    console.log("Transaction successful:", res);
                    setstart(false);
                    setadd(false);
                    setnumber("");
                    await onPaymentSuccess(number);
                  }}
                  autoStart={true}
                />
              )}
            </View>
          </View>

          {add && (
            <View style={{bottom: 119}} className="left-13 flex-row justify-between gap-x-4">
              <View className="relative bottom-5">
                <Text style={{ position: 'relative', left: 24, top: 55, color: 'black', fontSize: 16 }}>₦</Text>
                <TextInput
                  className="border border-gray-400 rounded-2xl w-[160px] px-4 py-9 flex-row items-center justify-between space-x-8 left-5"
                  onChangeText={handleTextChange4}
                  value={value4}
                  keyboardType="numeric"
                />
              </View>
              
              <TouchableOpacity onPress={Begin1}>
                <View className="top-5 w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                  <MaterialIcons name='check' size={26} color={'#fff'} />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={CancelEdit}>
                <View className="top-5 w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                  <MaterialIcons name='clear' size={26} color={'#fff'} />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Settings;
