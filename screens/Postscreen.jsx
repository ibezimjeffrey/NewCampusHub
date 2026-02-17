import { View, Text, Platform, TextInput, ActivityIndicator } from 'react-native'
import CustomPicker from '@/components/CustomPicker'
import React, { useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAvoidingView } from 'react-native'
import { ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { addDoc, collection, doc, getDoc, onSnapshot, query, setDoc } from 'firebase/firestore'
import { firestoreDB } from '../config/firebase.config'
import { Picker } from '@react-native-picker/picker';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import FancyTextInput from '@/components/FancyTextInput'
import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
import { serverTimestamp } from 'firebase/firestore';
import AppText from '@/components/AppText'


const scaleFont = (baseFont) => {
  if (width <= 320) return baseFont * 0.8; // very small phones
  if (width <= 375) return baseFont * 0.9; // small phones
  return baseFont; // normal & large phones
};


const Postscreen = () => {
  const [isApplying, setIsApplying] = useState(false); 
  const [isJob, setisJob] = useState(false)
  const [value, setvalue] = useState(""); 
  const [statevalue, setstatevalue] = useState("")
  const [value1, setvalue1] = useState(""); 
  const [otherJob, setotherJob] = useState("");
  const [statevalue1, setstatevalue1] = useState("")

  const [Balance, setBalance] = useState(0)
  
  const [value2, setvalue2] = useState(""); 
  const [statevalue2, setstatevalue2] = useState("")

  const [value4, setvalue4] = useState(""); 
  const [statevalue4, setstatevalue4] = useState("")
  const [isLong, setisLong] = useState(true)
  const navigation = useNavigation();
  const user = useSelector((state) => state.user.user)
  const currentDate = new Date();
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
const day = String(currentDate.getDate()).padStart(2, '0');
const hours = String(currentDate.getHours()).padStart(2, '0');
const minutes = String(currentDate.getMinutes()).padStart(2, '0');
const seconds = String(currentDate.getSeconds()).padStart(2, '0');

const Time = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
const DisplayTime = `${day}-${month}-${year}`;
const jobOptions = [
  { label: "Select job", value: "" },
  { label: "Makeup Artist", value: "Makeup Artist" },
  { label: "Catering services", value: "Catering services" },
  { label: "Cleaning services", value: "Cleaning services" },
  { label: "Personal Shopper", value: "Personal Shopper" },
  { label: "Tutoring", value: "Tutoring" },
  { label: "Nail Tech", value: "Nail Tech" },
  { label: "Writer", value: "Writer" },
  { label: "Hairstylist", value: "Hairstylist" },
  { label: "Delivery", value: "Delivery" },
  { label: "Graphic Designer", value: "Graphic Designer" },
  { label: "Essay Editing", value: "Essay Editing" },
  { label: "Fitness Training", value: "Fitness Training" },
  { label: "Errand Running", value: "Errand Running" },
  { label: "Photography", value: "Photography" },
  { label: "Other", value: "Other" },
];

const locationOptions = [
  { label: "Select Location", value: "" },
  { label: "Remote", value: "Remote" },
  { label: "Students' Center", value: "Students' Center" },
  { label: "Pod", value: "Pod Hostel" },
  { label: "Cooperative", value: "Cooperative" },
  { label: "Amethyst", value: "Amethyst" },
  { label: "Cedar", value: "Cedar" },
  { label: "Trezadel", value: "Trezadel" },
  { label: "Faith", value: "Faith" },
  { label: "EDC", value: "EDC" },
  { label: "Pearl", value: "Pearl" },
  { label: "Trinity", value: "Trinity" },
  { label: "Asther Hall", value: "Asther Hall" },
  { label: "Cooperative Queens", value: "Cooperative Queens" },
  { label: "Redwood", value: "Redwood" },
  { label: "SST", value: "SST" },
  { label: "TYD", value: "TYD" },
];


  const [COSavailable, setCOSavailable] = useState(false)
  const [Aboutavailable, setAboutavailable] = useState(false)

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


  useEffect(() => {
    const msgQuery = query(collection(firestoreDB, 'users', user._id, 'details'));
    const unsubscribe = onSnapshot(msgQuery, (querySnapshot) => {
      const upMsg = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCOSavailable(upMsg.length > 0 && upMsg[0].Hostel);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const msgQuery = query(collection(firestoreDB, 'users', user._id, 'details'));
    const unsubscribe = onSnapshot(msgQuery, (querySnapshot) => {
      const upMsg = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAboutavailable(upMsg.length > 0 && upMsg[0].About);
    });
    return unsubscribe;
  }, []);

  const handleTextChange = (text) => {
    setvalue(text); 
    setstatevalue(text); 
    setisLong(otherJob.length <= 20);
  };

  const handleJobChange = (text) => {
    setotherJob(text); 
    setisLong(text.length <= 20);
  };

  const handleTextChange1 = (text) => {
    setvalue1(text); 
    setstatevalue1(text); 
  };

  const handleTextChange2 = (text) => {
    setvalue2(text); 
    setstatevalue2(text); 
  };

  const handleTextChange4 = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    const formattedText = numericText ? Number(numericText).toLocaleString() : '';
    setvalue4(formattedText);
    setstatevalue4(formattedText);
  };

  let wordCount = otherJob.trim().split(/\s+/).filter(word => word.length > 0).length;

  const handlePost = async () => {
    setIsApplying(true);

    if (!value.trim() || !value1.trim()|| !value2.trim()|| !Time.trim()|| !value4.trim() ) {

       Toast.show({
                  type: ALERT_TYPE.WARNING,
                  title: 'Incomplete Details',
                  textBody:'Please fill in all details',
                });

      setIsApplying(false);
      return;
    }

    if (COSavailable == false || Aboutavailable == false ) {
       Toast.show({
                  type: ALERT_TYPE.WARNING,
                  title: 'Profile Incomplete',
                  textBody:'Please finish setting up your profile',
                });
      setIsApplying(false);
      return;
    }

    const numericBudget = parseInt(value4.replace(/,/g, ''), 10);
    if (numericBudget > 100000) {
       Toast.show({
                  type: ALERT_TYPE.WARNING,
                  title: 'Budget Too High',
                  textBody:'Budget has to be lower than N100,000',
                });
      setIsApplying(false);
      return;
    }

    if (numericBudget < 2000) {
       Toast.show({
                  type: ALERT_TYPE.WARNING,
                  title: 'Budget Too Low',
                  textBody:'Budget has to be at least N2,000',
                });
      setIsApplying(false);
      return;
    }

    if (numericBudget> Balance) {

       Toast.show({
                  type: ALERT_TYPE.WARNING,
                  title: 'Insufficient Balance',
                  textBody:'You do not have enough balance to post this job',
                });
                

      setIsApplying(false);
      return;
    }

    if (wordCount > 3) {
     Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Job Title Too Long',
                textBody:' Job title must be 3 words or less',
              });
      setIsApplying(false);
      return;
    }

    if(!(!otherJob.trim()) && !(!value.trim())){
      setotherJob("")
    }

    const id = `${user._id}-${Date.now()}`; 
    const jobDetails = otherJob !== "" ? otherJob : value; 

    const _doc = {
      _id: id,
      JobDetails: jobDetails,
      Description: value1,
      Location: value2,
      createdAt: serverTimestamp(),
      Type: Time,
      DisplayTime: DisplayTime,
      Budget: value4,
      User: user
    };

    await addDoc(collection(firestoreDB, "postings"), _doc)
      .then(() => {
        setIsApplying(false)
        setvalue("");
        setvalue1("");
        setvalue2("");
        setotherJob("")
        setvalue4("");
        addDoc(collection(firestoreDB, "AllPostings"), _doc)

         Toast.show({
  type: ALERT_TYPE.SUCCESS,
  title: 'Job successfully posted',
  textBody:'Your post has been added to the home feed',
});
        navigation.navigate("Home");
      })
      .catch(err => alert(err));
  };

  return (
    <SafeAreaView edges={['top']} className="bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView showsVerticalScrollIndicator={false} className="h-full">
          
          <View className="w-full h-full bg-white flex justify-start py-6 space-y-6">
            <View className="items-center">
              <AppText style={{color:"#268290"}} className="text-xl">Create Post</AppText>
            </View>

          <AppText style={{ fontSize: scaleFont(18), marginLeft: 20, color: '#000', fontWeight: '400' }}>
  Job Title
</AppText>

            <View>
       <CustomPicker
    label="Select job"
    value={value}
    onSelect={(itemValue) => handleTextChange(itemValue)}
    options={jobOptions}
  />
            </View>

            {value === "Other" && (
              <FancyTextInput
                style={{borderColor: otherJob.length > 0 ? "#268290" : "gray"}}
                className="border rounded-2xl w-[360px] px-4 py-9 flex-row items-center justify-between space-x-8 left-5 my-2"
                placeholder="Add job"
                multiline={true}
                onChangeText={handleJobChange}
                value={otherJob}
              />
            )}
        <AppText style={{ fontSize: scaleFont(18), marginLeft: 20, color: '#000', fontWeight: '400' }}>
  Description
</AppText>
            <FancyTextInput
              style={{borderColor: value1.length > 0 ? "#268290" : "gray"}}
              className="border rounded-2xl w-[360px] px-4 py-9 flex-row items-center justify-between space-x-8 left-5 my-2"
              placeholder="Describe the job"
              multiline={true}
              onChangeText={handleTextChange1}
              value={value1}
            />



        <AppText style={{ fontSize: scaleFont(18), marginLeft: 20, color: '#000', fontWeight: '400' }}>
  Location
</AppText>
            <View >
             <View className="">
 
   <CustomPicker
    label="Select location"
    value={value2}
    onSelect={(itemValue) => handleTextChange2(itemValue)}
    options={locationOptions}
  />
  
            </View>
             </View>

             




            {/* <Text className="left-5 text-xl">Where would the job be taking place</Text>
            <View className="left-4">
             <View className="">
  {user?.email?.endsWith("@pau.edu.ng") ? (
    <Picker
      className="left-5"
      selectedValue={value2}
      onValueChange={(itemValue) => handleTextChange2(itemValue)}
      style={{
        borderWidth: 1,
        borderColor: value2.length > 0 ? "#268290" : "gray",
        borderRadius: 20,
        paddingHorizontal: 18,
        width: 360
      }}
    >
      <Picker.Item label="Location" value="" />
      <Picker.Item label="Remote" value="Remote" />
      <Picker.Item label="Students' Center" value="Students' Center" />
      <Picker.Item label="Pod" value="Pod Hostel" />
      <Picker.Item label="Cooperative" value="Cooperative" />
      <Picker.Item label="Amethyst" value="Amethyst" />
      <Picker.Item label="Cedar" value="Cedar" />
      <Picker.Item label="Trezadel" value="Trezadel" />
      <Picker.Item label="Faith" value="Faith" />
      <Picker.Item label="EDC" value="EDC" />
      <Picker.Item label="Pearl" value="Pearl" />
      <Picker.Item label="Trinity" value="Trinity" />
      <Picker.Item label="Asther Hall" value="Asther Hall" />
      <Picker.Item label="Cooperative Queens" value="Cooperative Queens" />
      <Picker.Item label="Redwood" value="Redwood" />
      <Picker.Item label="SST" value="SST" />
      <Picker.Item label="TYD" value="TYD" />
    </Picker>
  ) : user?.email?.endsWith("@stu.cu.edu.ng") ? (
    <Picker
      className="left-5"
      selectedValue={value2}
      onValueChange={(itemValue) => handleTextChange2(itemValue)}
      style={{
        borderWidth: 1,
        borderColor: value2.length > 0 ? "#268290" : "gray",
        borderRadius: 20,
        paddingHorizontal: 18,
        width: 360
      }}
    >
      <Picker.Item label="Location" value="" />
      <Picker.Item label="Mary" value="Mary" />
      <Picker.Item label="Deborah" value="Deborah" />
      <Picker.Item label="Esther" value="Esther" />
      <Picker.Item label="Lydia" value="Lydia" />
      <Picker.Item label="Dorcas" value="Dorcas" />
      <Picker.Item label="John" value="John" />
      <Picker.Item label="Joseph" value="Joseph" />
      <Picker.Item label="Paul" value="Paul" />
      <Picker.Item label="Daniel" value="Daniel" />
      <Picker.Item label="Peter" value="Peter" />
      <Picker.Item label="Cafe 1" value="Cafe 1" />
      <Picker.Item label="Cafe 2" value="Cafe 2" />
      <Picker.Item label="Admirable Park" value="Admirable Park" />
      <Picker.Item label="Chapel" value="Chapel" />
      <Picker.Item label="CEDS" value="CEDS" />
    </Picker>
  ) : user?.email?.endsWith("@student.babcock.edu.ng") ? (
    <Picker
      className="left-5"
      selectedValue={value2}
      onValueChange={(itemValue) => handleTextChange2(itemValue)}
      style={{
        borderWidth: 1,
        borderColor: value2.length > 0 ? "#268290" : "gray",
        borderRadius: 20,
        paddingHorizontal: 18,
        width: 360
      }}
    >
      <Picker.Item label="Location" value="" />
      <Picker.Item label="Hebrew" value="Hebrew" />
      <Picker.Item label="YAM" value="YAM" />
      <Picker.Item label="Esther" value="Esther" />
      <Picker.Item label="Lydia" value="Lydia" />
      <Picker.Item label="Dorcas" value="Dorcas" />
      <Picker.Item label="John" value="John" />
      <Picker.Item label="Joseph" value="Joseph" />
      <Picker.Item label="Paul" value="Paul" />
      <Picker.Item label="Daniel" value="Daniel" />
      <Picker.Item label="Peter" value="Peter" />
      <Picker.Item label="Cafe 1" value="Cafe 1" />
      <Picker.Item label="Cafe 2" value="Cafe 2" />
      <Picker.Item label="Admirable Park" value="Admirable Park" />
      <Picker.Item label="Chapel" value="Chapel" />
      <Picker.Item label="CEDS" value="CEDS" />
    </Picker>
  ) : null}
</View>

            </View> */}

                    <AppText style={{ fontSize: scaleFont(18), marginLeft: 20, color: '#000', fontWeight: '400' }}>
  Budget
</AppText>
           
                           <FancyTextInput
                             className="flex-1 text-3xl  text-black "
                             keyboardType="numeric"
                             placeholder="0"
                             value={value4}
                             onChangeText={handleTextChange4}
                           />
                        
            

            <TouchableOpacity
  disabled={isApplying}
  onPress={handlePost}
  style={{
    width: Math.min(width - 40, 360), // responsive width, max 360
    marginLeft: 20,                   // replaces left-5
    paddingVertical: 12,              // vertical padding
    borderRadius: 16,                 // rounded corners
    backgroundColor: '#268290',       // replace with your primaryButton color
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  {isApplying ? (
    <ActivityIndicator size="small" color="#ffffff" />
  ) : (
    <AppText
      style={{
        color: '#fff',
        fontSize: scaleFont(18),   // responsive font size
        fontWeight: '600',
        paddingVertical: 6,
      }}
    >
      Post
    </AppText>
  )}
</TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Postscreen;
