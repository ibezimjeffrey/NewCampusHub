import { View, Text, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection, doc, onSnapshot, query } from 'firebase/firestore';
import { firebaseAuth, firestoreDB } from '../config/firebase.config';
import { useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';

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
      Alert.alert('Permission Denied', 'Permission to access the camera roll is required!');
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
        alert('Image successfully uploaded');
      } catch (error) {
        console.error('Upload Error: ', error);
        alert('Image upload failed');
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
      alert('Please fill in all details');
      setIsApplying(false);
      return;
    }

    if (wordCount < 15) {
      alert('Minimum of 15 words');
      setIsApplying(false);
      return;
    }

    if(AccountNumber.length !== 10){
      alert('Account number must be 10 digits');
      setIsApplying(false);
      return;
    }

    if (!isEmailVerified) {
      alert('Please verify your email address first.');
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
      alert(err.message);
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
            <Text className="py-2 text-primaryText text-xl font-semibold">Let's get to know you</Text>

            <Picker
              className="left-5"
              selectedValue={value}
              onValueChange={(itemValue) => handleTextChange(itemValue)}
              style={{
                borderWidth: 1,
                borderColor: value.length > 0 ? "#268290" : "gray",
                borderRadius: 20,
                paddingHorizontal: 18,
                width: 360,
                left: 20
              }}
            >
              <Picker.Item label="Course" value="" />
              <Picker.Item label="Mass Communication" value="Mass Communication" />
              <Picker.Item label="ISMS" value="ISMS" />
              <Picker.Item label="Mechanical Engineering" value="Mechanical Engineering" />
              <Picker.Item label="Business Administration" value="Business Administration" />
              <Picker.Item label="Computer Science" value="Computer Science" />
              <Picker.Item label="Electrical Engineering" value="Electrical Engineering" />
              <Picker.Item label="Economics" value="Economics" />
              <Picker.Item label="Software Engineering" value="Software Engineering" />
              <Picker.Item label="Finance" value="Finance" />
              <Picker.Item label="Accounting" value="Accounting" />
            </Picker>

            <Text className="left-5 text-base">Tell us about yourself</Text>
            <TextInput
              className={`border rounded-2xl w-[360px] h-[215px] px-4 py-9 flex-row items-center justify-between space-x-8 left-5 my-2 `}
              placeholder="(minimum of 15 words)"
              onChangeText={handleTextChange1}
              value={value1}
              multiline={true}
            />
            <Text className="left-5 text-base">What are your skills</Text>
            <TextInput
              className={`border rounded-2xl w-[360px]  px-4 py-9 flex-row items-center justify-between space-x-8 left-5 my-2 `}
              placeholder="Coding, Graphic Design...(Optional)"
              onChangeText={handleTextChange2}
              value={value2}
              multiline={true}
            />

            <Text className="left-5 text-base">Select Your Bank</Text>
            <View className="left-4">
                            <Picker
                              className="left-8"
                              selectedValue={Bank}
                              onValueChange={(itemValue) => handleTextChange3(itemValue)}
                              style={{ 
                                borderWidth: 1,
                                borderColor: value.length > 0 ? "#268290" : "gray",
                                borderRadius: 20,
                                paddingHorizontal: 18,
                                paddingVertical: 1,
                                width:360
                              }}
                            >
                           <Picker.Item label="..." value="" />
<Picker.Item label="9mobile 9Payment Service Bank" value="120001" />
<Picker.Item label="ALAT by WEMA" value="035A" />
<Picker.Item label="ASO Savings and Loans" value="401" />
<Picker.Item label="AVUENEGBE MICROFINANCE BANK" value="090478" />
<Picker.Item label="AWACASH MICROFINANCE BANK" value="51351" />
<Picker.Item label="AZTEC MICROFINANCE BANK LIMITED" value="51337" />
<Picker.Item label="Abbey Mortgage Bank" value="404" />
<Picker.Item label="Above Only MFB" value="51204" />
<Picker.Item label="Abulesoro MFB" value="51312" />
<Picker.Item label="Access Bank" value="044" />
<Picker.Item label="Access Bank (Diamond)" value="063" />
<Picker.Item label="Accion Microfinance Bank" value="602" />
<Picker.Item label="Aella MFB" value="50315" />
<Picker.Item label="AG Mortgage Bank" value="90077" />
<Picker.Item label="Ahmadu Bello University Microfinance Bank" value="50036" />
<Picker.Item label="Airtel Smartcash PSB" value="120004" />
<Picker.Item label="AKU Microfinance Bank" value="51336" />
<Picker.Item label="Akuchukwu Microfinance Bank Limited" value="090561" />
<Picker.Item label="Alpha Morgan Bank" value="108" />
<Picker.Item label="Alternative Bank" value="000304" />
<Picker.Item label="Amegy Microfinance Bank" value="090629" />
<Picker.Item label="Amju Unique MFB" value="50926" />
<Picker.Item label="Aramoko MFB" value="50083" />
<Picker.Item label="Assets Microfinance Bank" value="50092" />
<Picker.Item label="Astrapolaris MFB LTD" value="MFB50094" />
<Picker.Item label="BOLD MFB" value="50725" />
<Picker.Item label="BANKIT MICROFINANCE BANK LTD" value="50572" />
<Picker.Item label="BANKLY MFB" value="51341" />
<Picker.Item label="Bainescredit MFB" value="51229" />
<Picker.Item label="Banc Corp Microfinance Bank" value="50117" />
<Picker.Item label="Baobab Microfinance Bank" value="MFB50992" />
<Picker.Item label="BellBank Microfinance Bank" value="51100" />
<Picker.Item label="Benysta Microfinance Bank Limited" value="51267" />
<Picker.Item label="Beststar Microfinance Bank" value="50123" />
<Picker.Item label="Bosak Microfinance Bank" value="650" />
<Picker.Item label="Bowen Microfinance Bank" value="50931" />
<Picker.Item label="Branch International Finance Company Limited" value="FC40163" />
<Picker.Item label="Brent Mortgage Bank" value="90070" />
<Picker.Item label="BuyPower MFB" value="50645" />
<Picker.Item label="CASHCONNECT MFB" value="865" />
<Picker.Item label="CEMCS Microfinance Bank" value="50823" />
<Picker.Item label="CITYCODE MORTAGE BANK" value="070027" />
<Picker.Item label="CRUTECH MICROFINANCE BANK LTD" value="50216" />
<Picker.Item label="Carbon" value="565" />
<Picker.Item label="Cashbridge Microfinance Bank Limited" value="51353" />
<Picker.Item label="Chanelle Microfinance Bank Limited" value="50171" />
<Picker.Item label="Chikum Microfinance Bank" value="312" />
<Picker.Item label="Citibank Nigeria" value="023" />
<Picker.Item label="Consumer Microfinance Bank" value="50910" />
<Picker.Item label="Coronation Merchant Bank" value="559" />
<Picker.Item label="Corestep MFB" value="50204" />
<Picker.Item label="County Finance Limited" value="FC40128" />
<Picker.Item label="Credit Direct Limited" value="40119" />
<Picker.Item label="Crescent MFB" value="51297" />
<Picker.Item label="Crust Microfinance Bank" value="090560" />
<Picker.Item label="Dash Microfinance Bank" value="51368" />
<Picker.Item label="Davenport Microfinance Bank" value="51334" />
<Picker.Item label="Dillon Microfinance Bank" value="51450" />
<Picker.Item label="Dot Microfinance Bank" value="50162" />
<Picker.Item label="EBSU Microfinance Bank" value="50922" />
<Picker.Item label="EXCEL FINANCE BANK" value="090678" />
<Picker.Item label="Ecobank Nigeria" value="050" />
<Picker.Item label="Ekimogun MFB" value="50263" />
<Picker.Item label="Ekondo Microfinance Bank" value="098" />
<Picker.Item label="Eyowo" value="50126" />
<Picker.Item label="FIRSTMIDAS MFB" value="51333" />
<Picker.Item label="FIRST ROYAL MICROFINANCE BANK" value="090164" />
<Picker.Item label="FUTMINNA MICROFINANCE BANK" value="832" />
<Picker.Item label="Fairmoney Microfinance Bank" value="51318" />
<Picker.Item label="Fedeth MFB" value="50298" />
<Picker.Item label="Fidelity Bank" value="070" />
<Picker.Item label="Firmus MFB" value="51314" />
<Picker.Item label="First Bank of Nigeria" value="011" />
<Picker.Item label="First City Monument Bank (FCMB)" value="214" />
<Picker.Item label="FirstTrust Mortgage Bank Nigeria" value="413" />
<Picker.Item label="FSDH Merchant Bank Limited" value="501" />
<Picker.Item label="GTI MFB" value="50368" />
<Picker.Item label="Garun Mallam MFB" value="MFB51093" />
<Picker.Item label="Gateway Mortgage Bank LTD" value="812" />
<Picker.Item label="Globus Bank" value="00103" />
<Picker.Item label="GoMoney" value="100022" />
<Picker.Item label="Goodnews Microfinance Bank" value="50739" />
<Picker.Item label="Greenwich Merchant Bank" value="562" />
<Picker.Item label="GroomING MICROFINANCE BANK" value="51276" />
<Picker.Item label="Guaranty Trust Bank (GTBank)" value="058" />
<Picker.Item label="GOOD SHEPHERD MICROFINANCE BANK" value="090664" />
<Picker.Item label="Goldman MFB" value="090574" />
<Picker.Item label="Hackman Microfinance Bank" value="51251" />
<Picker.Item label="Hasal Microfinance Bank" value="50383" />
<Picker.Item label="HopePSB" value="120002" />
<Picker.Item label="IBANK Microfinance Bank" value="51211" />
<Picker.Item label="IBBU MFB" value="51279" />
<Picker.Item label="IMPERIAL HOMES MORTGAGE BANK" value="415" />
<Picker.Item label="INDULGE MFB" value="51392" />
<Picker.Item label="ISUA MFB" value="090701" />
<Picker.Item label="Ibile Microfinance Bank" value="51244" />
<Picker.Item label="Ibom Mortgage Bank" value="90012" />
<Picker.Item label="Ikoyi Osun MFB" value="50439" />
<Picker.Item label="Ilaro Poly Microfinance Bank" value="50442" />
<Picker.Item label="Imowo MFB" value="50453" />
<Picker.Item label="Infinity MFB" value="50457" />
<Picker.Item label="Infinity Trust Mortgage Bank" value="070016" />
<Picker.Item label="Jaiz Bank" value="301" />
<Picker.Item label="KANOPOLY MFB" value="51308" />
<Picker.Item label="KONGAPAY" value="100025" />
<Picker.Item label="Kadpoly MFB" value="50502" />
<Picker.Item label="Kayvee Microfinance Bank" value="5129" />
<Picker.Item label="Keystone Bank" value="082" />
<Picker.Item label="Kolomoni MFB" value="899" />
<Picker.Item label="Kredi Money MFB LTD" value="50200" />
<Picker.Item label="Kuda" value="50211" />
<Picker.Item label="LOMA MFB" value="50491" />
<Picker.Item label="Lagos Building Investment Company Plc." value="90052" />
<Picker.Item label="Letshego Microfinance Bank" value="090420" />
<Picker.Item label="Links MFB" value="50549" />
<Picker.Item label="Living Trust Mortgage Bank" value="031" />
<Picker.Item label="Lotus Bank" value="303" />
<Picker.Item label="MAINSTREET MICROFINANCE BANK" value="090171" />
<Picker.Item label="MINT-FINEX MFB" value="090281" />
<Picker.Item label="Maal MFB" value="51444" />
<Picker.Item label="Mayfair MFB" value="50563" />
<Picker.Item label="Mint MFB" value="50304" />
<Picker.Item label="Money Master PSB" value="946" />
<Picker.Item label="Moniepoint MFB" value="50515" />
<Picker.Item label="MTN Momo PSB" value="120003" />
<Picker.Item label="MUTUAL BENEFITS MICROFINANCE BANK" value="090190" />
<Picker.Item label="NDCC MICROFINANCE BANK" value="090679" />
<Picker.Item label="NET MICROFINANCE BANK" value="51361" />
<Picker.Item label="NOVA BANK" value="561" />
<Picker.Item label="NPF MICROFINANCE BANK" value="50629" />
<Picker.Item label="NSUK MICROFINANCE BANK" value="51261" />
<Picker.Item label="Nigerian Navy Microfinance Bank Limited" value="51142" />
<Picker.Item label="Nombank MFB" value="50072" />
<Picker.Item label="Novus MFB" value="51371" />
<Picker.Item label="OLUCHUKWU MICROFINANCE BANK LTD" value="50697" />
<Picker.Item label="Olabisi Onabanjo University Microfinance Bank" value="50689" />
<Picker.Item label="Opay" value="999992" />
<Picker.Item label="Optimus Bank" value="107" />
<Picker.Item label="PFI FINANCE COMPANY LIMITED" value="050021" />
<Picker.Item label="PROSPERIS FINANCE LIMITED" value="050023" />
<Picker.Item label="PATHFINDER MICROFINANCE BANK LIMITED" value="090680" />
<Picker.Item label="Paystack-Titan" value="100039" />
<Picker.Item label="Peace Microfinance Bank" value="50743" />
<Picker.Item label="Personal Trust MFB" value="51146" />
<Picker.Item label="Petra Microfinance Bank Plc" value="50746" />
<Picker.Item label="Pettysave MFB" value="MFB51452" />
<Picker.Item label="Platinum Mortgage Bank" value="268" />
<Picker.Item label="Pocket App" value="00716" />
<Picker.Item label="Polaris Bank" value="076" />
<Picker.Item label="Polyunwana MFB" value="50864" />
<Picker.Item label="PremiumTrust Bank" value="105" />
<Picker.Item label="Prospa Capital Microfinance Bank" value="50739" />
<Picker.Item label="Providus Bank" value="101" />
<Picker.Item label="QuickFund MFB" value="51293" />
<Picker.Item label="RANDALPHA MICROFINANCE BANK" value="090496" />
<Picker.Item label="REHOBOTH MICROFINANCE BANK" value="50761" />
<Picker.Item label="ROCKSHIELD MICROFINANCE BANK" value="50767" />
<Picker.Item label="Refuge Mortgage Bank" value="90067" />
<Picker.Item label="Rephidim Microfinance Bank" value="50994" />
<Picker.Item label="Rigo Microfinance Bank Limited" value="51286" />
<Picker.Item label="Rubies MFB" value="125" />
<Picker.Item label="SAGE GREY FINANCE LIMITED" value="40165" />
<Picker.Item label="STANFORD MICROFINANCE BANK" value="090162" />
<Picker.Item label="STATESIDE MICROFINANCE BANK" value="50809" />
<Picker.Item label="STB Mortgage Bank" value="070022" />
<Picker.Item label="Safe Haven MFB" value="51113" />
<Picker.Item label="Shield MFB" value="50582" />
<Picker.Item label="Signature Bank Ltd" value="106" />
<Picker.Item label="Solid Allianze MFB" value="51062" />
<Picker.Item label="Solid Rock MFB" value="50800" />
<Picker.Item label="Sparkle Microfinance Bank" value="51310" />
<Picker.Item label="Springfield Microfinance Bank" value="51429" />
<Picker.Item label="Stanbic IBTC Bank" value="221" />
<Picker.Item label="Standard Chartered Bank Nigeria" value="068" />
<Picker.Item label="Stellas MFB" value="51253" />
<Picker.Item label="Sterling Bank" value="232" />
<Picker.Item label="Summit Bank" value="00305" />
<Picker.Item label="SunTrust Bank" value="100" />
<Picker.Item label="Supreme MFB" value="50968" />
<Picker.Item label="TAJ Bank" value="302" />
<Picker.Item label="TENN" value="51403" />
<Picker.Item label="Think Finance Microfinance Bank" value="677" />
<Picker.Item label="Titan Trust Bank" value="102" />
<Picker.Item label="TransPay MFB" value="090708" />
<Picker.Item label="TRUSTBANC J6 MICROFINANCE BANK" value="51118" />
<Picker.Item label="U&C Microfinance Bank Ltd" value="50840" />
<Picker.Item label="UCEE MFB" value="090706" />
<Picker.Item label="UNIABUJA MFB" value="51447" />
<Picker.Item label="UNIMAID MICROFINANCE BANK" value="50875" />
<Picker.Item label="UNIUYO Microfinance Bank Ltd" value="50880" />
<Picker.Item label="Uzondu Microfinance Bank" value="50894" />
<Picker.Item label="Uhuru MFB" value="51322" />
<Picker.Item label="Unaab Microfinance Bank Limited" value="50870" />
<Picker.Item label="Unical MFB" value="50871" />
<Picker.Item label="Unilag Microfinance Bank" value="51316" />
<Picker.Item label="Union Bank" value="032" />
<Picker.Item label="United Bank for Africa (UBA)" value="033" />
<Picker.Item label="Unity Bank" value="215" />
<Picker.Item label="Ultraviolet Microfinance Bank" value="51080" />
<Picker.Item label="Vale Finance Limited" value="050020" />
<Picker.Item label="VFD Microfinance Bank Limited" value="566" />
<Picker.Item label="Waya Microfinance Bank" value="51355" />
<Picker.Item label="Wema Bank" value="035" />
<Picker.Item label="Weston Charis MFB" value="51386" />
<Picker.Item label="Xpress Wallet" value="100040" />
<Picker.Item label="Yes MFB" value="594" />
<Picker.Item label="Zap" value="00zap" />
<Picker.Item label="Zenith Bank" value="057" />
<Picker.Item label="Zitra MFB" value="51373" />
                            </Picker>

                            
                          </View>
 <Text className="left-5 text-base">Account Number</Text>
            <TextInput
              className={`border rounded-2xl w-[360px]  px-4 py-9 flex-row items-center justify-between space-x-8 left-5 my-2 `}
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

                
                <Text style={{ color: '#268290', textAlign: 'center', marginBottom: 10 }} className="text-base">
                  Upload Images of your work
                </Text>
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
                <Text className='py-2 text-white text-xl font-semibold'>Ready to work!</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Aboutscreen;
