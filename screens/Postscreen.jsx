import { View, Text, Platform, TextInput, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native'
import { KeyboardAvoidingView } from 'react-native'
import { ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { addDoc, collection, onSnapshot, query, serverTimestamp } from 'firebase/firestore'
import { firestoreDB } from '../config/firebase.config'
import { Picker } from '@react-native-picker/picker';

const Postscreen = () => {
  const [isApplying, setIsApplying] = useState(false); 
  const [isJob, setisJob] = useState(false)
  const [value, setvalue] = useState(""); 
  const [statevalue, setstatevalue] = useState("")
  const [value1, setvalue1] = useState(""); 
  const [otherJob, setotherJob] = useState("");
  const [statevalue1, setstatevalue1] = useState("")
  
  const [value2, setvalue2] = useState(""); 
  const [statevalue2, setstatevalue2] = useState("")

  const [value4, setvalue4] = useState(""); 
  const [statevalue4, setstatevalue4] = useState("")
  const [isLong, setisLong] = useState(true)
  const navigation= useNavigation();
  const user = useSelector((state) => state.user.user)
  const currentDate = new Date();
const day = String(currentDate.getDate()).padStart(2, '0');
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
const value3 = `${day}/${month}`;
const [COSavailable, setCOSavailable] = useState(false)
const [Aboutavailable, setAboutavailable] = useState(false)

useEffect(() => {
  const msgQuery = query(collection(firestoreDB, 'users', user._id, 'details'));
  const unsubscribe = onSnapshot(msgQuery, (querySnapshot) => {
    const upMsg = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
    if (upMsg.length > 0 && upMsg[0].Hostel) {
      setCOSavailable(true);
    } else {
      setCOSavailable(false);
    }
  });
  
  return unsubscribe;
}, []);


useEffect(() => {
  const msgQuery = query(collection(firestoreDB, 'users', user._id, 'details'));
  const unsubscribe = onSnapshot(msgQuery, (querySnapshot) => {
    const upMsg = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
    if (upMsg.length > 0 && upMsg[0].About) {
      setAboutavailable(true);
    } else {
      setAboutavailable(false);
    }
  });
  
  return unsubscribe;
}, []);



  const handleTextChange = (text) => {
    setvalue(text); 
    setstatevalue(text); 
    {
      otherJob.length > 20 ? (
        setisLong(false)
      ) : (
        setisLong(true)

      )
    }
  };

  const handleJobChange = (text) => {
    setotherJob(text); 
    {
      otherJob.length > 20 ? (
        setisLong(false)
      ) : (
        setisLong(true)

      )
    }
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
    // Remove non-numeric characters
    const numericText = text.replace(/[^0-9]/g, '');
    // Format the number with commas
    const formattedText = numericText ? Number(numericText).toLocaleString() : '';
    setvalue4(formattedText);
    setstatevalue4(formattedText);
  };
  let wordCount = otherJob.trim().split(/\s+/).filter(word => word.length > 0).length;

  const handlePost = async () => {
    setIsApplying(true);

    if (!value.trim() || !value1.trim()|| !value2.trim()|| !value3.trim()|| !value4.trim() ) {
      alert('Please fill in all details');
      setIsApplying(false);
      return;
    }

    if (COSavailable == false || Aboutavailable==false ) {
      alert('Please finish setting up your profile');
      setIsApplying(false);
      return;
    }

    const numericBudget = parseInt(value4.replace(/,/g, ''), 10);

    if (numericBudget > 500000) {
      alert('Budget has to be lower than N1,000,000');
      setIsApplying(false);
      return;
    }


    if (wordCount > 3) {
      alert('Job Title too long');
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


      Type: value3,


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

        alert("Job successfully posted");
        navigation.navigate("Home");
      })
      .catch(err => alert(err));
  };

  return (
    <SafeAreaView className="bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView className="h-full">
          
          <View className="w-full h-full bg-white flex  justify-start py-6 space-y-6">
          <View className="items-center">
            <Text style={{color:"#268290"}} className=" text-xl">
              Create Post
            </Text>
          </View>
            <Text className="left-5 text-xl">Job Title</Text>

            <View className="left-6">
            <Picker
            
            className="left-5"
            
  selectedValue={value}
  onValueChange={(itemValue) => handleTextChange(itemValue)}
  style={{ 
    borderWidth: 1,
    borderColor: value.length > 0 ? "#268290" : "gray",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 1,
    width:360
  }}
>
  <Picker.Item label="Select job" value="" />
  <Picker.Item label="Makeup Artist" value="Makeup Artist" />
  <Picker.Item label="Catering services" value="Catering services" />
  <Picker.Item label="Cleaning services" value="Cleaning services" />
  <Picker.Item label="Personal Shopper" value="Personal Shopper" />
  <Picker.Item label="Tutoring" value="Tutoring" />
  <Picker.Item label="Nail Tech" value="Nail Tech" />
  <Picker.Item label="Writer" value="Writer" />
  <Picker.Item label="Hairstylist" value="Hairstylist" />
  <Picker.Item label="Delivery" value="Delivery" />
  <Picker.Item label="Graphic Designer" value="Graphic Designer" />
  <Picker.Item label="Essay Editing" value="Essay Editing" />
  <Picker.Item label="Fitness Training" value="Fitness Training" />
  <Picker.Item label="Errand Running" value="Errand Running" />
  <Picker.Item label="Photography" value="Photography" />
  <Picker.Item label="Other" value="Other" />
</Picker>

            </View>
            
{
  value == "Other"?
  
  <TextInput
  style={{borderColor: otherJob.length > 0 ? "#268290" : "gray"}}
     className={`border rounded-2xl w-[360px]  px-4 py-9 flex-row items-center justify-between space-x-8 left-5 my-2 `}             

     placeholder= "Add job"
    multiline={true}
    onChangeText={handleJobChange}
    value={otherJob}
  />

  
  :
  (
    console.log("")

  )
}
            <Text className="left-5 text-xl">Description</Text>
            <TextInput
            style={{borderColor: value1.length > 0 ? "#268290" : "gray"}}
               className={`border rounded-2xl w-[360px]  px-4 py-9 flex-row items-center justify-between space-x-8 left-5 my-2 `}             

               placeholder= "Describe the job"
              multiline={true}
              onChangeText={handleTextChange1}
              value={value1}
            />


<Text className="left-5 text-xl">Where would the job be taking place</Text>
        
        <View className="left-6">
        <Picker
            className="left-5"
  selectedValue={value2}
  onValueChange={(itemValue) => handleTextChange2(itemValue)}
  style={{ 
    borderWidth: 1,
    borderColor: value2.length > 0 ? "#268290" : "gray",
    borderRadius: 20,
    paddingHorizontal: 18, 
    width:360
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

        </View>
            

            
            

            <Text className=" relative left-5 text-xl">Budget</Text>

            <View className="relative bottom-5 ">
    <Text style={{ position: 'relative', left: 24, top: 55, color: 'black', fontSize: 16 }}> ₦</Text>

    <TextInput
      className="border border-gray-400 rounded-2xl w-[360px] px-4 py-9 flex-row items-center justify-between space-x-8 left-5"
      onChangeText={handleTextChange4}
      value={value4}
      keyboardType="numeric"
    />


  </View>



            <TouchableOpacity disabled={isApplying} onPress={handlePost} className="w-[360px] left-5 px-4 rounded-xl bg-primaryButton my-3 flex items-center justify-center">
            {isApplying ? (
            <ActivityIndicator className="py-3" size="small" color="#ffffff" />
          ) : (
            <Text className='py-2 text-white text-xl font-semibold'>Post Job</Text>
          )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Postscreen;
