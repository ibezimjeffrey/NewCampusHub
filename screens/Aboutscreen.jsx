import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection, doc, onSnapshot, query } from 'firebase/firestore';
import { firebaseAuth, firestoreDB } from '../config/firebase.config';
import { useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { Dimensions } from "react-native";
const { width } = Dimensions.get("window");
import CustomPicker from "../components/CustomPicker";
import  FancyTextInput  from '../components/FancyTextInput';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import AppText from "../components/AppText";




const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dmtgcnjxv/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'umdj7bkg';

const Aboutscreen = () => {
  const [isApplying, setIsApplying] = useState(false);
  const [AccountNumber, setAccountNumber] = useState("")
  const [Bank, setBank] = useState("")
  const [value, setValue] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [value1, setValue1] = useState("");
  const [stateValue1, setStateValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [stateValue2, setStateValue2] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false); // New state for tracking image upload
  const navigation = useNavigation();
  const user = useSelector((state) => state.user.user);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [Details, setDetails] = useState('')
  
const bankOptions = [
  { label: "...", value: "" },
  { label: "9mobile 9Payment Service Bank", value: "120001" },
  { label: "ALAT by WEMA", value: "035A" },
  { label: "ASO Savings and Loans", value: "401" },
  { label: "AVUENEGBE MICROFINANCE BANK", value: "090478" },
  { label: "AWACASH MICROFINANCE BANK", value: "51351" },
  { label: "AZTEC MICROFINANCE BANK LIMITED", value: "51337" },
  { label: "Abbey Mortgage Bank", value: "404" },
  { label: "Above Only MFB", value: "51204" },
  { label: "Abulesoro MFB", value: "51312" },
  { label: "Access Bank", value: "044" },
  { label: "Access Bank (Diamond)", value: "063" },
  { label: "Accion Microfinance Bank", value: "602" },
  { label: "Aella MFB", value: "50315" },
  { label: "AG Mortgage Bank", value: "90077" },
  { label: "Ahmadu Bello University Microfinance Bank", value: "50036" },
  { label: "Airtel Smartcash PSB", value: "120004" },
  { label: "AKU Microfinance Bank", value: "51336" },
  { label: "Akuchukwu Microfinance Bank Limited", value: "090561" },
  { label: "Alpha Morgan Bank", value: "108" },
  { label: "Alternative Bank", value: "000304" },
  { label: "Amegy Microfinance Bank", value: "090629" },
  { label: "Amju Unique MFB", value: "50926" },
  { label: "Aramoko MFB", value: "50083" },
  { label: "Assets Microfinance Bank", value: "50092" },
  { label: "Astrapolaris MFB LTD", value: "MFB50094" },
  { label: "BOLD MFB", value: "50725" },
  { label: "BANKIT MICROFINANCE BANK LTD", value: "50572" },
  { label: "BANKLY MFB", value: "51341" },
  { label: "Bainescredit MFB", value: "51229" },
  { label: "Banc Corp Microfinance Bank", value: "50117" },
  { label: "Baobab Microfinance Bank", value: "MFB50992" },
  { label: "BellBank Microfinance Bank", value: "51100" },
  { label: "Benysta Microfinance Bank Limited", value: "51267" },
  { label: "Beststar Microfinance Bank", value: "50123" },
  { label: "Bosak Microfinance Bank", value: "650" },
  { label: "Bowen Microfinance Bank", value: "50931" },
  { label: "Branch International Finance Company Limited", value: "FC40163" },
  { label: "Brent Mortgage Bank", value: "90070" },
  { label: "BuyPower MFB", value: "50645" },
  { label: "CASHCONNECT MFB", value: "865" },
  { label: "CEMCS Microfinance Bank", value: "50823" },
  { label: "CITYCODE MORTAGE BANK", value: "070027" },
  { label: "CRUTECH MICROFINANCE BANK LTD", value: "50216" },
  { label: "Carbon", value: "565" },
  { label: "Cashbridge Microfinance Bank Limited", value: "51353" },
  { label: "Chanelle Microfinance Bank Limited", value: "50171" },
  { label: "Chikum Microfinance Bank", value: "312" },
  { label: "Citibank Nigeria", value: "023" },
  { label: "Consumer Microfinance Bank", value: "50910" },
  { label: "Coronation Merchant Bank", value: "559" },
  { label: "Corestep MFB", value: "50204" },
  { label: "County Finance Limited", value: "FC40128" },
  { label: "Credit Direct Limited", value: "40119" },
  { label: "Crescent MFB", value: "51297" },
  { label: "Crust Microfinance Bank", value: "090560" },
  { label: "Dash Microfinance Bank", value: "51368" },
  { label: "Davenport Microfinance Bank", value: "51334" },
  { label: "Dillon Microfinance Bank", value: "51450" },
  { label: "Dot Microfinance Bank", value: "50162" },
  { label: "EBSU Microfinance Bank", value: "50922" },
  { label: "EXCEL FINANCE BANK", value: "090678" },
  { label: "Ecobank Nigeria", value: "050" },
  { label: "Ekimogun MFB", value: "50263" },
  { label: "Ekondo Microfinance Bank", value: "098" },
  { label: "Eyowo", value: "50126" },
  { label: "FIRSTMIDAS MFB", value: "51333" },
  { label: "FIRST ROYAL MICROFINANCE BANK", value: "090164" },
  { label: "FUTMINNA MICROFINANCE BANK", value: "832" },
  { label: "Fairmoney Microfinance Bank", value: "51318" },
  { label: "Fedeth MFB", value: "50298" },
  { label: "Fidelity Bank", value: "070" },
  { label: "Firmus MFB", value: "51314" },
  { label: "First Bank of Nigeria", value: "011" },
  { label: "First City Monument Bank (FCMB)", value: "214" },
  { label: "FirstTrust Mortgage Bank Nigeria", value: "413" },
  { label: "FSDH Merchant Bank Limited", value: "501" },
  { label: "GTI MFB", value: "50368" },
  { label: "Garun Mallam MFB", value: "MFB51093" },
  { label: "Gateway Mortgage Bank LTD", value: "812" },
  { label: "Globus Bank", value: "00103" },
  { label: "GoMoney", value: "100022" },
  { label: "Goodnews Microfinance Bank", value: "50739" },
  { label: "Greenwich Merchant Bank", value: "562" },
  { label: "GroomING MICROFINANCE BANK", value: "51276" },
  { label: "Guaranty Trust Bank (GTBank)", value: "058" },
  { label: "GOOD SHEPHERD MICROFINANCE BANK", value: "090664" },
  { label: "Goldman MFB", value: "090574" },
  { label: "Hackman Microfinance Bank", value: "51251" },
  { label: "Hasal Microfinance Bank", value: "50383" },
  { label: "HopePSB", value: "120002" },
  { label: "IBANK Microfinance Bank", value: "51211" },
  { label: "IBBU MFB", value: "51279" },
  { label: "IMPERIAL HOMES MORTGAGE BANK", value: "415" },
  { label: "INDULGE MFB", value: "51392" },
  { label: "ISUA MFB", value: "090701" },
  { label: "Ibile Microfinance Bank", value: "51244" },
  { label: "Ibom Mortgage Bank", value: "90012" },
  { label: "Ikoyi Osun MFB", value: "50439" },
  { label: "Ilaro Poly Microfinance Bank", value: "50442" },
  { label: "Imowo MFB", value: "50453" },
  { label: "Infinity MFB", value: "50457" },
  { label: "Infinity Trust Mortgage Bank", value: "070016" },
  { label: "Jaiz Bank", value: "301" },
  { label: "KANOPOLY MFB", value: "51308" },
  { label: "KONGAPAY", value: "100025" },
  { label: "Kadpoly MFB", value: "50502" },
  { label: "Kayvee Microfinance Bank", value: "5129" },
  { label: "Keystone Bank", value: "082" },
  { label: "Kolomoni MFB", value: "899" },
  { label: "Kredi Money MFB LTD", value: "50200" },
  { label: "Kuda", value: "50211" },
  { label: "LOMA MFB", value: "50491" },
  { label: "Lagos Building Investment Company Plc.", value: "90052" },
  { label: "Letshego Microfinance Bank", value: "090420" },
  { label: "Links MFB", value: "50549" },
  { label: "Living Trust Mortgage Bank", value: "031" },
  { label: "Lotus Bank", value: "303" },
  { label: "MAINSTREET MICROFINANCE BANK", value: "090171" },
  { label: "MINT-FINEX MFB", value: "090281" },
  { label: "Maal MFB", value: "51444" },
  { label: "Mayfair MFB", value: "50563" },
  { label: "Mint MFB", value: "50304" },
  { label: "Money Master PSB", value: "946" },
  { label: "Moniepoint MFB", value: "50515" },
  { label: "MTN Momo PSB", value: "120003" },
  { label: "MUTUAL BENEFITS MICROFINANCE BANK", value: "090190" },
  { label: "NDCC MICROFINANCE BANK", value: "090679" },
  { label: "NET MICROFINANCE BANK", value: "51361" },
  { label: "NOVA BANK", value: "561" },
  { label: "NPF MICROFINANCE BANK", value: "50629" },
  { label: "NSUK MICROFINANCE BANK", value: "51261" },
  { label: "Nigerian Navy Microfinance Bank Limited", value: "51142" },
  { label: "Nombank MFB", value: "50072" },
  { label: "Novus MFB", value: "51371" },
  { label: "OLUCHUKWU MICROFINANCE BANK LTD", value: "50697" },
  { label: "Olabisi Onabanjo University Microfinance Bank", value: "50689" },
  { label: "Opay", value: "999992" },
  { label: "Optimus Bank", value: "107" },
  { label: "PFI FINANCE COMPANY LIMITED", value: "050021" },
  { label: "PROSPERIS FINANCE LIMITED", value: "050023" },
  { label: "PATHFINDER MICROFINANCE BANK LIMITED", value: "090680" },
  { label: "Paystack-Titan", value: "100039" },
  { label: "Peace Microfinance Bank", value: "50743" },
  { label: "Personal Trust MFB", value: "51146" },
  { label: "Petra Microfinance Bank Plc", value: "50746" },
  { label: "Pettysave MFB", value: "MFB51452" },
  { label: "Platinum Mortgage Bank", value: "268" },
  { label: "Pocket App", value: "00716" },
  { label: "Polaris Bank", value: "076" },
  { label: "Polyunwana MFB", value: "50864" },
  { label: "PremiumTrust Bank", value: "105" },
  { label: "Prospa Capital Microfinance Bank", value: "50739" },
  { label: "Providus Bank", value: "101" },
  { label: "QuickFund MFB", value: "51293" },
  { label: "RANDALPHA MICROFINANCE BANK", value: "090496" },
  { label: "REHOBOTH MICROFINANCE BANK", value: "50761" },
  { label: "ROCKSHIELD MICROFINANCE BANK", value: "50767" },
  { label: "Refuge Mortgage Bank", value: "90067" },
  { label: "Rephidim Microfinance Bank", value: "50994" },
  { label: "Rigo Microfinance Bank Limited", value: "51286" },
  { label: "Rubies MFB", value: "125" },
  { label: "SAGE GREY FINANCE LIMITED", value: "40165" },
  { label: "STANFORD MICROFINANCE BANK", value: "090162" },
  { label: "STATESIDE MICROFINANCE BANK", value: "50809" },
  { label: "STB Mortgage Bank", value: "070022" },
  { label: "Safe Haven MFB", value: "51113" },
  { label: "Shield MFB", value: "50582" },
  { label: "Signature Bank Ltd", value: "106" },
  { label: "Solid Allianze MFB", value: "51062" },
  { label: "Solid Rock MFB", value: "50800" },
  { label: "Sparkle Microfinance Bank", value: "51310" },
  { label: "Springfield Microfinance Bank", value: "51429" },
  { label: "Stanbic IBTC Bank", value: "221" },
  { label: "Standard Chartered Bank Nigeria", value: "068" },
  { label: "Stellas MFB", value: "51253" },
  { label: "Sterling Bank", value: "232" },
  { label: "Summit Bank", value: "00305" },
  { label: "SunTrust Bank", value: "100" },
  { label: "Supreme MFB", value: "50968" },
  { label: "TAJ Bank", value: "302" },
  { label: "TENN", value: "51403" },
  { label: "Think Finance Microfinance Bank", value: "677" },
  { label: "Titan Trust Bank", value: "102" },
  { label: "TransPay MFB", value: "090708" },
  { label: "TRUSTBANC J6 MICROFINANCE BANK", value: "51118" },
  { label: "U&C Microfinance Bank Ltd", value: "50840" },
  { label: "UCEE MFB", value: "090706" },
  { label: "UNIABUJA MFB", value: "51447" },
  { label: "UNIMAID MICROFINANCE BANK", value: "50875" },
  { label: "UNIUYO Microfinance Bank Ltd", value: "50880" },
  { label: "Uzondu Microfinance Bank", value: "50894" },
  { label: "Uhuru MFB", value: "51322" },
  { label: "Unaab Microfinance Bank Limited", value: "50870" },
  { label: "Unical MFB", value: "50871" },
  { label: "Unilag Microfinance Bank", value: "51316" },
  { label: "Union Bank", value: "032" },
  { label: "United Bank for Africa (UBA)", value: "033" },
  { label: "Unity Bank", value: "215" },
  { label: "Ultraviolet Microfinance Bank", value: "51080" },
  { label: "Vale Finance Limited", value: "050020" },
  { label: "VFD Microfinance Bank Limited", value: "566" },
  { label: "Waya Microfinance Bank", value: "51355" },
  { label: "Wema Bank", value: "035" },
  { label: "Weston Charis MFB", value: "51386" },
  { label: "Xpress Wallet", value: "100040" },
  { label: "Yes MFB", value: "594" },
  { label: "Zap", value: "00zap" },
  { label: "Zenith Bank", value: "057" },
  { label: "Zitra MFB", value: "51373" },
];


 useEffect(() => {
     const msgQuery = query(collection(firestoreDB, 'users', user._id, 'details'));
     const unsubscribe = onSnapshot(msgQuery, (querySnapshot) => {
       const upMsg = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
       setDetails(upMsg);
 
     });
     
     return unsubscribe;
   }, []);



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        await user.reload();
        setIsEmailVerified(user.emailVerified);

        const verificationListener = setInterval(async () => {
          await user.reload();
          setIsEmailVerified(user.emailVerified);
          if (user.emailVerified) {
            clearInterval(verificationListener);
          }
        }, 5000);

        return () => clearInterval(verificationListener);
      } else {
        setIsEmailVerified(false);
      }
    });

    return unsubscribe;
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
                              type: ALERT_TYPE.WARNING,
                              title: 'Permission Denied',
                              textBody:' Permission to access media library is required!',
                              titleStyle: {
    fontFamily: "serif",
    fontSize: 16,
  },

  textBodyStyle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
  }
                            });
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      try {
        setIsUploading(true); // Start uploading
        const response = await fetch(CLOUDINARY_URL, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const responseData = await response.json();
        const imageUrl = responseData.secure_url;
        setSelectedImages((prevImages) => [...prevImages, imageUrl]);
        Toast.show({
                                type: ALERT_TYPE.WARNING,
                                title: 'Upload Successful',
                                textBody:' Image uploaded successfully!',
                                titleStyle: {
    fontFamily: "serif",
    fontSize: 16,
  },

  textBodyStyle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
  }
                              });
      } catch (error) {
        console.error('Upload Error: ', error);
       Toast.show({
                               type: ALERT_TYPE.WARNING,
                               title: 'Upload Failed',
                               textBody:' Image upload failed.',
                               titleStyle: {
    fontFamily: "serif",
    fontSize: 16,
  },

  textBodyStyle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
  }
                             });
      } finally {
        setIsUploading(false); // End uploading
      }
    } else {
      console.log('Image selection canceled');
    }
  };



  const handleTextChange = (text) => {
    setValue(text);
    setStateValue(text);
  };

  const handleTextChange1 = (text) => {
    setValue1(text);
    setStateValue1(text);
  };

  const handleTextChange2 = (text) => {
    setValue2(text);
    setStateValue2(text);
  };



    const handleTextChange3 = (text) => {
    setBank(text); 

  };

      const handleTextChange4= (text) => {
    setAccountNumber(text);

  };

  let wordCount = value1.trim().split(/\s+/).filter(word => word.length > 0).length;
  let wordCount1 = value.trim().split(/\s+/).filter(word => word.length > 0).length;
  let wordCount2 = value2.trim().split(/\s+/).filter(word => word.length > 0).length;

  const handleAbout = async () => {
    setIsApplying(true);

    if (!value.trim() || !value1.trim() ) {
     Toast.show({
                             type: ALERT_TYPE.WARNING,
                             title: 'Incomplete Details',
                             textBody:'Please fill in all details',

             
  titleStyle: {
    fontFamily: "serif",
    fontSize: 16,
  },

  textBodyStyle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
  }
                           });
      setIsApplying(false);
      return;
    }

    if (wordCount < 15) {
      Toast.show({
                              type: ALERT_TYPE.WARNING,
                              title: 'Insufficient Words',
                              textBody:' Please provide at least 15 words about yourself.',
                              titleStyle: {
    fontFamily: "serif",
    fontSize: 16,
  },

  textBodyStyle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
  }
                            });
      setIsApplying(false);
      return;
    }

    if(AccountNumber.length !== 10){
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Invalid Account Number',
        textBody:'Account number must be 10 digits',
        titleStyle: {
    fontFamily: "serif",
    fontSize: 16,
  },

  textBodyStyle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
  }
      });
      setIsApplying(false);
      return;
    }

    if (!isEmailVerified) {
      Toast.show({
                              type: ALERT_TYPE.WARNING,
                              title: 'Email Not Verified',
                              textBody:' Please verify your email before proceeding.',
                              titleStyle: {
    fontFamily: "serif",
    fontSize: 16,
  },

  textBodyStyle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
  }
                            });
      setIsApplying(false);
      return;
    }

    const skillsArray = value2.trim().split(',').map(skill => skill.trim());

    const _doc = {
      _id: user._id,
      Hostel: value,
      About: value1,
      Skills: skillsArray.join(', '),
      images: selectedImages,
      AccountNumber: AccountNumber,
      Bank: Bank
    };

    try {
      await addDoc(collection(doc(firestoreDB, "users", user._id), "details"), _doc);
      navigation.navigate("Homescreen"); 
    } catch (err) {
      console.error("Error adding document: ", err);
      Toast.show({
                              type: ALERT_TYPE.DANGER,
                              title: 'Submission Failed',
                              textBody:' There was an error submitting your details. Please try again.',
                              titleStyle: {
    fontFamily: "serif",
    fontSize: 16,
  },

  textBodyStyle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
  }
                            });
    }
    setIsApplying(false);
  };

  return (
    <SafeAreaView className="h-full bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="h-full">
          <View className="w-full h-full bg-white flex  justify-start py-6 space-y-6">
            <AppText className="py-2 text-primaryText text-xl font-semibold">Let's get to know you</AppText>

       <CustomPicker
  label="Select your course"
  value={value}
  onSelect={setValue}
  options={[
    { label: "Mass Communication", value: "Mass Communication" },
    { label: "ISMS", value: "ISMS" },
    { label: "Mechanical Engineering", value: "Mechanical Engineering" },
    { label: "Business Administration", value: "Business Administration" },
    { label: "Computer Science", value: "Computer Science" },
     { label: "Electrical Engineering", value: "Electrical Engineering" },
      { label: "Finance", value: "Finance" },
  ]}
/>


            <AppText className="left-5 text-base">Tell us about yourself</AppText>
       <FancyTextInput
  style={{
    width: width - 40,
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  }}
 placeholder="(minimum of 15 words)"
              onChangeText={handleTextChange1}
              value={value1}
              multiline={true}

/>

            
             
          




            <AppText className="left-5 text-base">What are your skills</AppText>


         <FancyTextInput
  style={{
    width: width - 40,
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  }}
   placeholder="Coding, Graphic Design...(Optional)"
              onChangeText={handleTextChange2}
              value={value2}
  multiline
/>

   


            <AppText className="left-5 text-base">Select Your Bank</AppText>
            <View className="">

              
                              <CustomPicker
  label="Select your bank"
  value={Bank}
  onSelect={handleTextChange3}
  options={bankOptions}
/>
            
                          </View>





 <AppText className="left-5 text-base">Account Number</AppText>



          <FancyTextInput
  style={{
    width: width - 40,
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  }}

              onChangeText={handleTextChange4}
              value={AccountNumber}
              multiline={true}
               keyboardType="numeric"
            />

            <TouchableOpacity
              style={{
                width: 200,
                height: 200,
                borderColor: '#268290',
                borderWidth: 2,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 10,
                backgroundColor: '#fff',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
                elevation: 5,
              }}
              className="self-center"
              onPress={pickImage}
            >

              


              <View>

                
                <AppText style={{ color: '#268290', textAlign: 'center', marginBottom: 10 }} className="text-base">
                  Upload Images of your work(Optional)
                </AppText>
                {isUploading && <ActivityIndicator size="large" color="#268290" />}
              </View>
            </TouchableOpacity>

            

            <View className="left-5 flex-row flex-wrap">
              {selectedImages.map((imageUri, index) => (
                <Image key={index} resizeMode="cover" style={{ width: 100, height: 100, margin: 5 }} source={{ uri: imageUri }} />
              ))}
            </View>

            <TouchableOpacity
              onPress={handleAbout}
              className="w-full px-4 rounded-xl bg-primaryButton my-3 flex items-center justify-center">
              {isApplying ? (
                <ActivityIndicator className="py-3" size="small" color="#ffffff" />
              ) : (
                <AppText className='py-2 text-white text-xl font-semibold'>Ready to work!</AppText>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Aboutscreen;
