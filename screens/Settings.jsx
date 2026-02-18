import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { firebaseAuth, firestoreDB } from '../config/firebase.config';
import { useSelector } from 'react-redux';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  doc,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Paystack } from 'react-native-paystack-webview';
import axios from 'axios';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import LoadingOverlay from './LoadingOverlay';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/AppText';

const Settings = () => {
  const user = useSelector((state) => state.user.user);
  const navigation = useNavigation();
  const [IsAdding, setIsAdding] = useState(false);
  const [details, setDetails] = useState([]);
  const [Balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  // Add Money states
  const [add, setAdd] = useState(false);
  const [start, setStart] = useState(false);
  const [value4, setValue4] = useState('');
  const [number, setNumber] = useState('');

  // Withdraw states
  const [withdraw, setWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNumber, setWithdrawNumber] = useState(0);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [isApplying, setIsApplying] = useState(false);

  // Fetch bank details
  useEffect(() => {
    const q = query(collection(firestoreDB, 'users', user._id, 'details'));
    const unsub = onSnapshot(q, (snap) => {
      setDetails(snap.docs.map((d) => d.data()));
    });
    return unsub;
  }, []);

  // Fetch balance
  useEffect(() => {
    const fetchBalance = async () => {
      const ref = doc(firestoreDB, 'Balance', user._id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setBalance(parseFloat(snap.data().Amount));
      } else {
        await setDoc(ref, { Amount: 0 });
        setBalance(0);
      }
    };
    fetchBalance();
  }, [user._id]);

  // Fetch transactions
  useEffect(() => {
    const q = query(
      collection(firestoreDB, 'TransactionHistory'),
      where('userId', '==', user._id),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return unsub;
  }, [user._id]);

  // Shared input formatter
  const formatInput = (text, setter, numSetter) => {
    const numeric = text.replace(/[^0-9]/g, '');
    setter(numeric ? Number(numeric).toLocaleString() : '');
    numSetter(numeric ? parseFloat(numeric) : 0);
  };

   const handleTextChange4 = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    const formattedText = numericText ? Number(numericText).toLocaleString() : '';
    setValue4(formattedText);
    const amountInKobo = numericText ? parseFloat(numericText) : 0;
    setNumber(amountInKobo);
  };

  // Add Money Handlers
  const openAdd = () => {
    setAdd(true);
    setWithdraw(false);
  };

  const confirmAdd = () => {
    if (number > 0) {
      setStart(true);
    }
  };

  const cancelAdd = () => {
    setAdd(false);
    setValue4('');
    setNumber(0);
  };

  // Withdraw Handlers
  const openWithdraw = () => {
    setWithdraw(true);
    setAdd(false);
    setWithdrawAmount('');
    setWithdrawNumber(0);
  };

  const cancelWithdraw = () => {
    setWithdraw(false);
    setWithdrawAmount('');
    setWithdrawNumber(0);
  };

  const confirmWithdraw = async () => {
    if (withdrawNumber > Balance) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Insufficient Balance',
        textBody: 'You do not have enough funds',
      });
      return;
    }

    if (!details[0]?.AccountNumber) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'No Bank Account',
        textBody: 'Please add bank details first',
      });
      return;
    }
    

    try {
      setIsWithdrawing(true);

      await axios.post(
        'https://ruachbackend.onrender.com/withdraw',
        {
          userId: user._id,
          amount: withdrawNumber * 100,
          accountNumber: details[0]?.AccountNumber,
          bankCode: details[0]?.Bank,
          name: user.fullName,
        },
        { headers: { 'x-api-key': '3a7f9b2d-87f4-4c7a-b88d-9c63f07e6d12' } }
      );

      const newBalance = Balance - withdrawNumber;
      await setDoc(doc(firestoreDB, 'Balance', user._id), { Amount: newBalance });

      await addDoc(collection(firestoreDB, 'TransactionHistory'), {
        userId: user._id,
        type: 'debit',
        amount: withdrawNumber,
        reason: 'Wallet withdrawal',
        createdAt: serverTimestamp(),
      });

      setBalance(newBalance);
      setWithdraw(false);
      setWithdrawAmount('');
      setWithdrawNumber(0);

      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Withdrawal Sent 💸',
        textBody: 'Your funds will arrive within 3–4 hours',
      });
    } catch (err) {
      console.error(err);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Withdrawal Failed',
        textBody: 'Please try again later',
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const onPaymentSuccess = async (amount) => {
    const newBalance = Balance + amount;
    await setDoc(doc(firestoreDB, 'Balance', user._id), { Amount: newBalance });
    await addDoc(collection(firestoreDB, 'TransactionHistory'), {
      userId: user._id,
      type: 'credit',
      amount,
      reason: 'Wallet funding',
      createdAt: serverTimestamp(),
    });
    setBalance(newBalance);
  };

  const logout = async () => {
    setIsApplying(true);
   
   await firebaseAuth.signOut();
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView edges={['top','bottom']} >
        <ScrollView  contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
       className="px-4">

          {/* Header */}
          <View className="flex-row justify-between pt-4">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="chevron-left" size={32} color="#268290" />
            </TouchableOpacity>
            <TouchableOpacity onPress={logout}>
             
                <AppText className="text-[#268290] font-bold">Logout</AppText>
             
            </TouchableOpacity>
          </View>

           {isApplying ? (
                <LoadingOverlay visible={true} />
              ) : (
                ""
              )}

          {/* Balance */}
          <View className="items-center mt-10">
            <AppText className="text-4xl font-bold">
              ₦{Balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </AppText>
            <AppText className="text-gray-500 mt-1">Available Balance</AppText>
          </View>

          {/* Deposit / Withdraw Buttons */}
          <View className="items-center mt-8">
            <View className="border border-[#268290] rounded-2xl flex-row justify-around w-4/5 py-5">
              <TouchableOpacity onPress={openAdd} className="items-center">
                <View className="w-14 h-14 border border-[#268290] rounded-full items-center justify-center">
                  <MaterialIcons name="add" size={28} color="#268290" />
                </View>
                <AppText className="mt-2 font-medium">Deposit</AppText>
              </TouchableOpacity>

              <TouchableOpacity onPress={openWithdraw} className="items-center">
                <View className="w-14 h-14 border border-[#268290] rounded-full items-center justify-center">
                  <MaterialIcons name="arrow-downward" size={28} color="#268290" />
                </View>
                <AppText className="mt-2 font-medium">Withdraw</AppText>
              </TouchableOpacity>
            </View>
          </View>

        

          {/* Transactions */}
          <View className="mt-12">
            <AppText className="text-xl font-bold mb-4">Recent Transactions</AppText>
            {transactions.length === 0 ? (
              <AppText className="text-center text-gray-500">No transactions yet</AppText>
            ) : (
              transactions.map((tx) => (
                <View key={tx.id} className="flex-row justify-between py-4 border-b border-gray-200">
                  <View>
                    <AppText className="font-medium">{tx.reason}</AppText>
                    <AppText className="text-xs text-gray-500">
                      {tx.createdAt?.seconds
                        ? new Date(tx.createdAt.seconds * 1000).toLocaleDateString()
                        : 'Just now'}
                    </AppText>
                  </View>
                  <AppText
                    className={`font-bold ${
                      tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                  </AppText>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* === NEW WITHDRAW MODAL (Replaces old inline input) === */}

      <ScrollView>

      
      <Modal visible={withdraw} transparent animationType="slide">
          <KeyboardAvoidingView
                    className="flex-1"
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
              
                  
                  >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-[#268290] rounded-t-3xl overflow-hidden">
            {/* Header */}
            <View className="items-center py-8">

              <AppText className="text-6xl mt-6">💰</AppText>
            </View>

            {/* Input Section */}
            <View className="bg-white rounded-t-3xl px-6 pt-10 pb-12">
              <AppText className="text-lg text-center text-gray-800 mb-6">Enter Amount to Withdraw</AppText>

              <View className="flex-row items-center bg-gray-100 rounded-2xl px-6 h-20">
                <AppText className="text-4xl font-bold mr-3">₦</AppText>
                <TextInput
                  className="flex-1 text-4xl font-bold text-black pt-1"
                  keyboardType="numeric"
                  placeholder="0"
                  value={withdrawAmount}
                  onChangeText={(text) => formatInput(text, setWithdrawAmount, setWithdrawNumber)}
                />
              </View>

              <AppText className="text-center text-gray-500 mt-6">
                Funds will be sent to your linked bank account
              </AppText>

              {/* Buttons */}
              <TouchableOpacity
                onPress={confirmWithdraw}
                disabled={isWithdrawing || withdrawNumber === 0}
                className="mt-10 bg-black rounded-full py-5 items-center"
              >
                <AppText className="text-white text-lg font-bold">
                  {isWithdrawing ? 'Processing...' : 'Continue'}
                </AppText>
              </TouchableOpacity>

              {isWithdrawing ? (
        <LoadingOverlay visible={true} />
        
        ) : (
          ""
        )}

              <TouchableOpacity onPress={cancelWithdraw} className="mt-5 items-center">
                <AppText className="text-gray-600 text-base">Cancel</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
      </ScrollView>






         <ScrollView>

      
      <Modal visible={add} transparent animationType="slide">
         <KeyboardAvoidingView
                    className="flex-1"
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
              
                  
                  >

                  
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-[#268290] rounded-t-3xl overflow-hidden">
            {/* Header */}
            <View className="items-center py-8">

              <AppText className="text-6xl mt-6">💰</AppText>
            </View>

            {/* Input Section */}
            <View className="bg-white rounded-t-3xl px-6 pt-10 pb-12">
              <AppText className="text-lg text-center text-gray-800 mb-6">Enter Amount to Deposit</AppText>

              <View className="flex-row items-center bg-gray-100 rounded-2xl px-6 h-20">
                <AppText className="text-4xl font-bold mr-3">₦</AppText>
                <TextInput
                  className="flex-1 text-4xl font-bold text-black pt-1"
                  keyboardType="numeric"
                  placeholder="0"
                  value={value4}
                  onChangeText={handleTextChange4}
                />
              </View>

              <AppText className="text-center text-gray-500 mt-6">
                Funds will be deposited from your bank account
              </AppText>

              {/* Buttons */}
              <TouchableOpacity
                onPress={() => {
  setAdd(false); 
  setValue4('')  
  setStart(true); 
}}

                className="mt-10 bg-black rounded-full py-5 items-center"
              >
                <AppText className="text-white text-lg font-bold">
                  {!add ? 'Processing...' : 'Continue'}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity onPress={cancelAdd} className="mt-5 items-center">
                <AppText className="text-gray-600 text-base">Cancel</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
      </ScrollView>





      {/* Paystack for Add Money */}
      {start && (
        <Paystack
          paystackKey="pk_test_bb056f19149cb6867f38cb9019f7f94defd87bc0"
          amount={number}
          billingEmail={user.email}
          onCancel={() => {
            setIsAdding(true);
            setStart(false);
            setAdd(false);
          }}
          onSuccess={async () => {
            await onPaymentSuccess(number);
            Toast.show({
              type: ALERT_TYPE.SUCCESS,
              title: 'Wallet credited 💸',
            });
            setIsAdding(false);
            setStart(false);
            setAdd(false);
            setValue4('');
            setNumber(0);
          }}
          autoStart
          activityIndicatorColor=""
        />
      )}

      {isWithdrawing && <LoadingOverlay visible />}
    </View>
  );
};

export default Settings