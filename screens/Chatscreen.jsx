import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, TextInput, Image, Linking, Alert } from 'react-native';
import { Entypo, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { addDoc, collection, doc, getDocs,getDoc, onSnapshot, orderBy, query, serverTimestamp, where, setDoc } from 'firebase/firestore';
import { firestoreDB } from '../config/firebase.config';
import { BlurView } from 'expo-blur';
import LoadingOverlay from './LoadingOverlay';
import * as ImagePicker from 'expo-image-picker';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

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
      alert("Insufficient funds")
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
      setIsHired(false)
      setIsPaid(true);
      setIsApplying(false)


      const newBalance = Balance - Price
      const balanceDocRef = doc(firestoreDB, 'Balance', user._id);
      await setDoc(balanceDocRef, { Amount: newBalance }); // Store the new balance in Firestore

      const charge =  FreelancerBalance + Price
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
      
      <View className="flex-1">
        
      <BlurView className="w-full bg-slate-300 px-4 py-1" tint='extraLight' intensity={40}>
  <View className="flex-row items-center justify-between w-full py-12 px-4">
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <MaterialIcons name="chevron-left" size={32} color={"#fbfbfb"} />
    </TouchableOpacity>

    <View style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ flexDirection: 'column', alignItems: 'center' }}>
        <TouchableOpacity onPress={viewProfile}>
          <View>
            <Image source={{ uri: post.user.profilePic }} resizeMode="contain" className="rounded-full  w-12 h-12" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={viewProfile}>
          <View>
            <Text className="text-black text-base font-light capitalize shadow">
              {post.user.fullName}
            </Text>
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
            {isHired && !IsPaid? (
  <TouchableOpacity onPress={PAY}>
    <View style={{ left: 20 }} className="relative">
      <View className="border-1 left-7 mr-8 bg-yellow-400 border-emerald-950 rounded-lg p-4">
        <Text className="font-bold text-zinc-950">PAY</Text>
      </View>
    </View>
  </TouchableOpacity>
) : (

<>
{!IsPaid ? (
  <TouchableOpacity disabled={isApplying} onPress={Employ}>
    <View style={{ left: 20 }} className="relative">
      <View className="border-1 left-7 bg-red-400 border-emerald-950 mr-8 rounded-lg p-4">
        <Text className="font-bold text-zinc-950">HIRE</Text>
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
        <Text className="font-bold text-zinc-950">PAID</Text>
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
                  <View style={{ backgroundColor: "#facc15" }} className="border-1 left-7 mr-8 border-emerald-950 rounded-lg p-4">
                    <Text className="font-bold text-zinc-950">HIRED</Text>
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
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={140}
          
          >
            <>
              <ScrollView className="h-full">
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

          <Text className="text-base font-semibold text-white">
            {msg.message}
          </Text>
          </View>
        )}
   
      </View>
    ) : (
      <View  style={{ alignSelf: "flex-start" }}>
              {msg.image ? (
          <Image source={{ uri: msg.image }} style={{ width: 150, height: 150, borderRadius: 10 }} />
        ) : (
          <View className="px-4 py-2 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl bg-gray-300 w-auto relative ">

          <Text className="text-base  text-black">
            {msg.message}
          </Text>
          </View>
          
        )}
      </View>
   
    )}
    <View style={{ alignSelf: msg.user._id === user._id ? "flex-end" : "flex-start" }}>
      {msg?.timeStamp?.seconds && (
        <Text className="text-[12px] text-black ">
          {new Date(parseInt(msg?.timeStamp?.seconds) * 1000).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: false,
          })}
        </Text>
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
                    className="flex-1 h-8 text-base text-primaryText font-semibold"
                    placeholder="Type here..."
                    placeholderTextColor="#999"
                    value={message}
                    onChangeText={(text) => { setMessage(text) }}
                  />
                  <TouchableOpacity onPress={pickImage}>
                    <Entypo name="camera" size={24} color="black" />
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
    </View>
  );
};

export default Chatscreen;

