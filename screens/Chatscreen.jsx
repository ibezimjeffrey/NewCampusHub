import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, TextInput, Image, Linking, Alert } from 'react-native';
import { Entypo, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { addDoc, collection, doc, getDocs,getDoc, onSnapshot, orderBy, query, serverTimestamp, where, setDoc, deleteDoc } from 'firebase/firestore';
import { firestoreDB } from '../config/firebase.config';
import { BlurView } from 'expo-blur';
import LoadingOverlay from './LoadingOverlay';
import * as ImagePicker from 'expo-image-picker';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { Dimensions, PixelRatio } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { PricingButton } from 'react-native-elements/dist/pricing/PricingCard';
import AppText from '@/components/AppText';
const { width } = Dimensions.get('window');

const scaleFont = (baseFont) => {
  if (width <= 320) return baseFont * 0.75; // very small phones
  if (width <= 360) return baseFont * 0.85; // small phones
  if (width <= 375) return baseFont * 0.9;  // medium phones
  return baseFont;                           // normal & large phones
};

const Chatscreen = ({ route }) => {
  const [IsPaid, setIsPaid] = useState(false)
  const { post } = route.params;
  const [Paid, setPaid] = useState(false)
  const navigation = useNavigation();
  const user = useSelector((state) => state.user.user);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading1, setIsLoading1] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isHired, setIsHired] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [FreelanceHired, setFreelanceHired] = useState(false)
  const [isApplying, setIsApplying] = useState(false);
  const [Balance, setBalance] = useState(0)
  const [FreelancerBalance, setFreelancerBalance] = useState(0)
  const Price = parseFloat(post.price.replace(/[^0-9.-]+/g, ''));
  const [Left, setLeft] = useState(0)

  useLayoutEffect(() => {
    const msgQuery = query(
      collection(firestoreDB, 'messages'),
      where('idRoom', '==', post.idRoom),
      orderBy("timeStamp", "asc")
    );

    const unsubscribe = onSnapshot(msgQuery, (querySnapshot) => {
      const upMsg = querySnapshot.docs.map(doc => doc.data());
      setMessages(upMsg);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [post._id]);


   const removePost = async (postIdToRemove) => {
      
      try {
        await deleteDoc(doc(firestoreDB, 'postings', postIdToRemove));
         
      } catch (error) {
        console.error('Error removing document: ', error);
      }
    };



  useEffect(() => {
    const checkHiredStatus = async () => {
      try {
        const statusSnapshot = await getDocs(query(collection(firestoreDB, 'Status'), where('post._id', '==', post._id)));
        setIsHired(!statusSnapshot.empty);
        setIsLoading1(false)
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking hired status:', error);
      }
    };

    checkHiredStatus();
  }, [post.idRoom]);



    useEffect(() => {
      try {
       if( user._id !== post.index1) {
        setLeft("50");
        } else {
          setLeft("0");
        }
      } catch (error) {
        console.error('Error checking role status:', error);
      }
   
  }, []);




   useEffect(() => {
    const checkPaidStatus = async () => {
      try {
        const statusSnapshot = await getDocs(query(collection(firestoreDB, 'Payments'), where('post._id', '==', post._id)));
        setIsPaid(!statusSnapshot.empty);
        setIsLoading1(false)
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking paid status:', error);
      }
    };

    checkPaidStatus();
  }, [post.idRoom]);





  useEffect(() => {
    const checkHiredStatus = async () => {
      try {
        const statusSnapshot = await getDocs(query(collection(firestoreDB, 'Status'), where('post.idRoom', '==', post.idRoom ) ));
        setFreelanceHired(!statusSnapshot.empty);
        setIsLoading1(false)
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking hired status:', error);
      }
    };

    checkHiredStatus();
  }, [post.idRoom]);


  useEffect(() => {
    const getUserBalance = async () => {
      try {

        const balanceDocRef = doc(firestoreDB, 'Balance', user._id);
        const balanceDocSnapshot = await getDoc(balanceDocRef);
  
        if (balanceDocSnapshot.exists()) {
   
          const existingBalance = parseFloat(balanceDocSnapshot.data().Amount);
          
          setBalance(existingBalance)
          
        } 
      } catch (error) {
        console.error("Error fetching initial balance: ", error);
      }
    };
 


 
    getUserBalance();
  }, [user._id]); 
  

  useEffect(() => {
    const getFreelancerBalance = async () => {
      try {

        const balanceDocRef = doc(firestoreDB, 'Balance', post.user._id);
        const balanceDocSnapshot = await getDoc(balanceDocRef);
  
        if (balanceDocSnapshot.exists()) {
   
          const existingBalance = parseFloat(balanceDocSnapshot.data().Amount);
          
          setFreelancerBalance(existingBalance)
          console.log(FreelancerBalance)

        
          
        } 
      } catch (error) {
        console.error("Error fetching initial balance: ", error);
      }
    };
 


 
    getFreelancerBalance();
  }, [post.user._id]); 






  const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dmtgcnjxv/image/upload';
  const CLOUDINARY_UPLOAD_PRESET = 'umdj7bkg';

  const sendImage = async (imageUri) => {
    setIsApplying(true)
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseData = await response.json();
      const imageUrl = responseData.secure_url;

      const timeStamp = serverTimestamp();
    const newImageMessage = {
      _id: post.idRoom,
      roomId: post._id,
      post: post,
      timeStamp: timeStamp,
      user: user,
      receipient: post.user._id,
      idRoom: post.idRoom,
      image: imageUrl,
    };

    await addDoc(collection(firestoreDB, "messages"), newImageMessage);
    setIsApplying(false)
     
    } catch (error) {
      alert('Check wifi connection');
    } 
  };

  

  const sendMessage = async () => {
    if (!message.trim()) {
      alert('Please enter a message.');
      return;
    }

    const timeStamp = serverTimestamp();
    const newMessage = {
      _id: post.idRoom,
      roomId: post._id,
      post: post,
      timeStamp: timeStamp,
      message: message,
      user: user,
      receipient: post.user._id,
      idRoom: post.idRoom,
    };

    setMessage('');

    try {
      await addDoc(collection(firestoreDB, "messages"), newMessage);
    } catch (error) {
      alert('Error sending message: ' + error);
    }
  };

  const viewProfile = () => {
    navigation.navigate("ViewProfilescreen", { post: post });
  };

  const makePhoneCall = () => {
    Linking.openURL(`tel:${post.user.email}`);
  };

  const Employ = async () => {

    if (Balance < Price){
       Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Insufficient Funds',
        textBody: 'You do not have enough funds to hire this freelancer.',
      });
      return;
      
    }

    
    try {
      setIsApplying(true)
      const id = `${post.user._id}-${Date.now()}`;
      const room_id = `${user._id}-${Date.now()}-${new Date().getSeconds()}`;
      const hireStatus = {
        _id: id,
        user: user,
        receipient: post.user,
        status: true,
        idRoom: room_id,
        post: post,
        price: post.price,
      };
      await addDoc(collection(firestoreDB, 'Status'), hireStatus);
      removePost(post.idRoom)
      setIsHired(true);
      setIsApplying(false)
      
        Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: post.user.fullName  + ' has been successfully hired',
       
      });
      
    } catch (error) {
      console.error('Error hiring:', error);
    }
  };








const PAY = async () => {
    try {

      setIsApplying(true)
      const id = `${post.user._id}-${Date.now()}`;
      const room_id = `${user._id}-${Date.now()}-${new Date().getSeconds()}`;
      const PaymentStatus = {
        _id: id,
        user: user,
        receipient: post.user,
        status: true,
        idRoom: room_id,
        post: post,
        price: post.price,
      };
      await addDoc(collection(firestoreDB, 'Payments'), PaymentStatus);

       const feeAmount = Math.round(Price * (7.5 / 100));
       const User_Amount = Price - feeAmount;

      // USER DEBIT TRANSACTION
await addDoc(collection(firestoreDB, 'TransactionHistory'), {
  userId: user._id,
  type: 'debit',
  amount: Price,
  reason: `Payment to ${post.user.fullName}`,
  relatedPostId: post._id,
  relatedUserId: post.user._id,
  createdAt: serverTimestamp()
});


await axios.post(
     'https://ruachbackend.onrender.com/charges',
        {
          userId: user._id,
          amount: feeAmount,
          name: user.fullName,
        },
        { headers: { 'x-api-key': '3a7f9b2d-87f4-4c7a-b88d-9c63f07e6d12' } }
      );


// FREELANCER CREDIT TRANSACTION
await addDoc(collection(firestoreDB, 'TransactionHistory'), {
  userId: post.user._id,
  type: 'credit',
  amount: User_Amount,
  reason: `Payment from ${user.fullName}`,
  relatedPostId: post._id,
  relatedUserId: user._id,
  createdAt: serverTimestamp()
});


      setIsHired(false)
      setIsPaid(true);
      setIsApplying(false)


      const newBalance = Balance - Price
      const balanceDocRef = doc(firestoreDB, 'Balance', user._id);
      await setDoc(balanceDocRef, { Amount: newBalance }); // Store the new balance in Firestore

      const charge =  FreelancerBalance + User_Amount
      const balanceDocRef1 = doc(firestoreDB, 'Balance', post.user._id);
      await setDoc(balanceDocRef1, { Amount: charge }); // Store the new balance in Firestore

     
        Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Payment successful',
        textBody: 'Freelancer has been paid successfully',
      });
      
    
      
    } catch (error) {
      console.error('Payment error:', error);
    }
  };





  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();


    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setSelectedImages(prevImages => [...prevImages, imageUri]);
      sendImage(imageUri);
    }
  };



  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView className="bg-slate-300" style={{ flex: 1 }}>
      
      
      <View className="flex-1">
        
      <BlurView className="w-full bg-slate-300 px-4 py-1" >
  <View className="flex-row items-center justify-between w-full py-12 px-4">
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <MaterialIcons name="chevron-left" size={32} color={"#fbfbfb"} />
    </TouchableOpacity>

    

    <View  style={{ flex: 1, alignItems: 'center', marginLeft: Left }} >
      
      <View style={{ flexDirection: 'column', alignItems: 'center' }}>
        <TouchableOpacity onPress={viewProfile}>
          <View>
            <Image source={{ uri: post.user.profilePic }} resizeMode="contain" className="rounded-full  w-12 h-12" style={{  borderRadius: 80, borderWidth: 2, borderColor: '#268290' }} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={viewProfile}>
          <View>
           <AppText
  style={{
    color: '#000',
    fontSize: scaleFont(16),       // scales based on screen

    textTransform: 'capitalize',
    textAlign: 'center',
  }}
  numberOfLines={1}                // ensures it stays in one line
  adjustsFontSizeToFit={true}      // automatically shrinks font if too long
  minimumFontScale={0.7}           // shrink down to 70% of original
>
  {post.user.fullName}
</AppText>

          </View>
        </TouchableOpacity>
      </View>
    </View>

    <View style={{ alignItems: 'flex-end' }}>
      {isLoading1 ? (
        <View className="w-full flex items-center justify-center">
        <ActivityIndicator size={"large"} color={"#268290"} />
      </View>
      ) : (
        user._id !== post.index1 && (
          <>
            {isHired && !IsPaid ? (
  <TouchableOpacity onPress={PAY}>
    <View style={{ left: 20 }} className="relative">
      <View className="border-1 left-7 mr-8 bg-yellow-400 border-emerald-950 rounded-lg p-4">
       <AppText
  style={{
    fontSize: scaleFont(16),
   
    color: '#000',
  }}
  numberOfLines={1}
  adjustsFontSizeToFit={true}
  minimumFontScale={0.7}
>
  PAY 
</AppText>
<AppText>₦{post.price}</AppText>

      </View>
    </View>
  </TouchableOpacity>
) : (

<>
{!IsPaid ? (
  <TouchableOpacity disabled={isApplying} onPress={Employ}>
    <View style={{ left: 20 }} className="relative">
      <View className="border-1 left-7 bg-red-400 border-emerald-950 mr-8 rounded-lg p-4">
      <AppText
  style={{
    fontSize: scaleFont(16),
  
    color: '#000',
  }}
  numberOfLines={1}
  adjustsFontSizeToFit={true}
  minimumFontScale={0.7}
>
  HIRE
</AppText>

      </View>
    </View>
  </TouchableOpacity>
) : (
 "")}

</>

 


)}

          </>



        )
      )}
<>

{IsPaid ? (
  <TouchableOpacity disabled>
    <View style={{ left: 20 }} className="relative">
      <View style={{ backgroundColor: "#88E788" }} className="border-1 left-7  border-emerald-950 mr-8 rounded-lg p-4">
        <AppText
  style={{
    fontSize: scaleFont(16),
    
    color: '#000',
  }}
  numberOfLines={1}
  adjustsFontSizeToFit={true}
  minimumFontScale={0.7}
>
  PAID
</AppText>

      </View>
    </View>
  </TouchableOpacity>
) 
: ('')}

</>
      
        {isApplying ? (
        <LoadingOverlay visible={true} />
        
        ) : (
          ""
        )}
      

      {
        user._id == post.index1 && FreelanceHired ?
        <View style={{ left: 20 }} className="relative">
      <View style={{ backgroundColor: "#facc15" }} className="border-1 left-7  border-emerald-950 mr-8 rounded-lg p-4">
        <AppText
  style={{
    fontSize: scaleFont(16),
   
    color: '#000',
  }}
  numberOfLines={1}
  adjustsFontSizeToFit={true}
  minimumFontScale={0.7}
>
  HIRED
</AppText>

      </View>
    </View>

     
                :
                ("")
                
                

      }
    </View>
  </View>
</BlurView>


        <View className="w-full bg-gray-100 px-4 py-6 flex-1 -mt-10">
          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : "padding"}
            keyboardVerticalOffset={190}
          
          >
            <>
              <ScrollView
      showsVerticalScrollIndicator={false}
      
      className="h-full">
                {isLoading ? (
                  <View className="w-full flex items-center justify-center">
                    <ActivityIndicator size={"large"} color={"#268290"} />
                  </View>
                ) : (
                  
                  <>
                  {messages?.map((msg, i) => (
  <View className='m-1' key={i}>
    {msg.user._id === user._id ? (
      <View style={{ alignSelf: "flex-end" }}>

              {msg.image ? (
          <Image source={{ uri: msg.image }} style={{ width: 150, height: 150, borderRadius: 10 }} />
        ) : (
          <View  className="px-4 py-2 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl bg-blue-400 w-auto relative ">

         <AppText
  style={{
    fontSize: scaleFont(14),        // responsive font size
               // equivalent to font-semibold
    color: '#fff',                   // keep white text
  }}
  numberOfLines={6}                  // keeps it on a single line (optional)
  adjustsFontSizeToFit={true}        // shrink font if it overflows
  minimumFontScale={0.7}             // shrink down to 70% of original size
>
  {msg.message}
</AppText>

          </View>
        )}
   
      </View>
    ) : (
      <View  style={{ alignSelf: "flex-start" }}>
              {msg.image ? (
          <Image source={{ uri: msg.image }} style={{ width: 150, height: 150, borderRadius: 10 }} />
        ) : (
          <View className="px-4 py-2 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl bg-gray-300 w-auto relative ">

          <AppText className="text-base  text-black">
           <AppText
  style={{
    fontSize: scaleFont(14),        // responsive font size
               // equivalent to font-semibold
                      // keep white text
  }}
  numberOfLines={6}                  // keeps it on a single line (optional)
  adjustsFontSizeToFit={true}        // shrink font if it overflows
  minimumFontScale={0.7}             // shrink down to 70% of original size
>
  {msg.message}
</AppText>

          </AppText>
          </View>
          
        )}
      </View>
   
    )}
    <View style={{ alignSelf: msg.user._id === user._id ? "flex-end" : "flex-start" }}>
      {msg?.timeStamp?.seconds && (
        <AppText className="text-[12px] text-black ">
          {new Date(parseInt(msg?.timeStamp?.seconds) * 1000).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: false,
          })}
        </AppText>
      )}
    </View>
  </View>
))}
                </>
                )}

{isApplying ? (
        <LoadingOverlay visible={true} />
        
        ) : (
          ""
        )}

              </ScrollView>

              <View className='w-full flex-row items-center justify-center px-8'>
                <View className="bg-gray-200 rounded-2xl px-4 space-x-4 py-2 flex-row items-center justify-center">
                  
                  <TextInput
                    className="flex-1 pb-1 pt-1"
                    placeholder="Send a Chat"
                    
                    placeholderTextColor="#999"
                    value={message}
                    onChangeText={(text) => { setMessage(text) }}
                  />
                  <TouchableOpacity onPress={pickImage}>
                    <Entypo name="folder-images"size={24} color="black" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity className="pl-4" onPress={sendMessage}>
                  <FontAwesome name="send" size={24} color="light-blue" />
                </TouchableOpacity>
              </View>

              
            </>
          </KeyboardAvoidingView>
        </View>
      </View>
      </SafeAreaView>
    </View>
  );
};

export default Chatscreen;

