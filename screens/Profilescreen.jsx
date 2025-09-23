import React, { useState, useEffect } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'react-native-elements';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { firebaseAuth, firestoreDB } from '../config/firebase.config';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Picker } from '@react-native-picker/picker';

const Profilescreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [value, setvalue] = useState("");
  const [Edit, setEdit] = useState(false);
  const [jobCount, setJobCount] = useState(0);
  const [allHires, setAllHires] = useState(0);
  const [postings, setPostings] = useState([]);
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [Finish, setFinish] = useState(true);
  const [tapCount, setTapCount] = useState(0);
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false); 
  const [isSending, setIsSending] = useState(false); 
  const id = `${user._id}-${Date.now()}`;
  const [COS, setCOS] = useState("")
  const [NoCOs, setNoCOs] = useState(false)
  const [COSavailable, setCOSavailable] = useState(false)
  const [imageSize, setImageSize] = useState({ width: 100, height: 100 });
  const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dmtgcnjxv/image/upload';
  const CLOUDINARY_UPLOAD_PRESET = 'umdj7bkg';
  const [SkillsAvailable, setSkillsAvailable] = useState(false)
  const [ActivateSkills, setActivateSkills] = useState(false)
  const [skills, setskills] = useState("")

  const sendImage = async (imageUri) => {
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

      const newImageMessage = {
        _id: id,
        user: user,
        image: imageUrl,
      };

      await addDoc(collection(firestoreDB, "portfolio"), newImageMessage);
      alert("Images successfully added");
      console.log("Image sent");
    } catch (error) {
      alert('Check wifi connection');
    } finally {
      setIsUploading(false);
    }
  };

  const EditAbout = () => {
    setEdit(true);
  };

  const handleTextChange = (text) => {
    setCOS(text);
    
  };

  const setSkills = ()=>{
    setActivateSkills(true)
  }

  const SaveSkills = async () =>
  {
    if (skills.length > 0) {
      setActivateSkills(false)
      try {
        let docRef;
        if (details.length === 0) {
          // If details collection doesn't exist for user, create a new document
          docRef = await addDoc(collection(firestoreDB, 'users', user._id, 'details'), { Skills: skills, _id: user._id});
        } 
        else {
          // Update the existing document
          docRef = doc(firestoreDB, 'users', user._id, 'details', details[0].id);
          await updateDoc(docRef, { Skills: skills});
        }
        setDetails((prevDetails) => {
          const newDetails = [...prevDetails];
          if (newDetails.length === 0) {
            newDetails.push({ id: docRef.id, Skills: skills });
          } else {
            newDetails[0].Skills = skills;
          }
          return newDetails;
        });
        
    
       
        alert('Skills updated');
        setSkillsAvailable(true)
        
        
      } catch (error) {
        console.error("Error updating document: ", error);
        alert('Error saving changes');
      }
    }

    else{
      setActivateSkills(false)
    }


  }


  const SaveEdit = async () => {
    if (value.length > 0) {
      try {
        setIsSending(true)
        
        let docRef;
        if (details.length === 0) {
          // If details collection doesn't exist for user, create a new document
          docRef = await addDoc(collection(firestoreDB, 'users', user._id, 'details'), { About: value, _id: user._id});
        } else {
          // Update the existing document
          docRef = doc(firestoreDB, 'users', user._id, 'details', details[0].id);
          await updateDoc(docRef, { About: value});
        }
  
        setDetails((prevDetails) => {
          const newDetails = [...prevDetails];
          if (newDetails.length === 0) {
            newDetails.push({ id: docRef.id, About: value });
          } else {
            newDetails[0].About = value;
          }
          return newDetails;
        });
        setIsSending(false)
        alert('Bio successfully updated');
        setvalue("");
        setEdit(false);
      } catch (error) {
        console.error("Error updating document: ", error);
        alert('Error saving changes');
      }
    } else {
      CancelEdit();
    }
  };
  
  const COSfunction = () =>{
    if (NoCOs == false)
    {
      setNoCOs(true)
      setCOSavailable(true);
      
    }

    if (NoCOs == true)
      {
        setNoCOs(false)
        setCOSavailable(false);
      }

  }

  const SendCOS = async() =>{
    if (COS.length > 0) {
      setNoCOs(false)
      try {
        let docRef;
        if (details.length === 0) {
          // If details collection doesn't exist for user, create a new document
          docRef = await addDoc(collection(firestoreDB, 'users', user._id, 'details'), { Hostel: COS, _id: user._id});
        } 
        else {
          // Update the existing document
          docRef = doc(firestoreDB, 'users', user._id, 'details', details[0].id);
          await updateDoc(docRef, { Hostel: COS});
        }
        setDetails((prevDetails) => {
          const newDetails = [...prevDetails];
          if (newDetails.length === 0) {
            newDetails.push({ id: docRef.id, Hostel: COS });
          } else {
            newDetails[0].Hostel = COS;
          }
          return newDetails;
        });
        
        setEdit(false);
        setCOSavailable(true);
        alert('Course of study updated');
        
        
      } catch (error) {
        console.error("Error updating document: ", error);
        alert('Error saving changes');
      }
    } else {
      COSfunction();
    }


  }
  

  const CancelEdit = () => {
    setEdit(false);
    setvalue("")
  };

  const HandleAboutChange = (text) => {
    setvalue(text);
  };

  const HandleAboutChange1 = (text) => {
    setskills(text);
  };

  const logout = async () => {
    setIsApplying(true);
    await firebaseAuth.signOut().then(() => {
      dispatch(SET_USER_NULL());
      navigation.replace('Loginscreen');
    });
  };

  const deleteImage = async (imageUri) => {
    try {
      // Delete image from the portfolio collection
      setIsUploading(true);
      const imageQuery = query(collection(firestoreDB, 'portfolio'), where('image', '==', imageUri));
      const querySnapshot = await getDocs(imageQuery);
      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        setPortfolioImages((prevImages) => prevImages.filter((img) => img !== imageUri));
        alert("Image deleted")
        setIsUploading(false);
        
      } else {
        ""
      }
  
      // Delete image from the details collection
      const detailsQuery = query(collection(firestoreDB, 'users', user._id, 'details'));
      const detailsSnapshot = await getDocs(detailsQuery);
      if (!detailsSnapshot.empty) {
        detailsSnapshot.forEach(async (doc) => {
          const docData = doc.data();
          if (docData.images && Array.isArray(docData.images) && docData.images.includes(imageUri)) {
            const updatedImages = docData.images.filter((img) => img !== imageUri);
            await updateDoc(doc.ref, { images: updatedImages });
            setDetails((prevDetails) => {
              const newDetails = [...prevDetails];
              const index = newDetails.findIndex((d) => d.id === doc.id);
              if (index !== -1) {
                newDetails[index].images = updatedImages;
              }
              return newDetails;
            });
            Alert.alert('Image Deleted', 'The image has been successfully deleted');
          }
        });
      } else {
        ""
      }
    } catch (error) {
      console.error('Error deleting image: ', error);
      Alert.alert('Error', 'Failed to delete image.');
    }
  };
  

  const handleImagePress = (imageUri) => {
      deleteImage(imageUri);  
  };
  


  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(firestoreDB, 'Status'), where('receipient._id', '==', user._id)), (querySnapshot) => {
      setAllHires(querySnapshot.docs.length);
    });
    return unsubscribe;
  }, [user._id]);

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(firestoreDB, 'portfolio'), where('user._id', '==', user._id)), (querySnapshot) => {
      const images = querySnapshot.docs.map(doc => doc.data().image);
      setPortfolioImages(images);
      console.log(images.length > 0);
      setFinish(false);
    });
    return unsubscribe;
  }, [user._id]);

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(firestoreDB, 'AllPostings'), where('User._id', '==', user._id)), (querySnapshot) => {
      setJobCount(querySnapshot.docs.length);
    });
    return unsubscribe;
  }, [user._id]);

  useEffect(() => {
    const msgQuery = query(collection(firestoreDB, 'users', user._id, 'details'));
    const unsubscribe = onSnapshot(msgQuery, (querySnapshot) => {
      const upMsg = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDetails(upMsg);
      setIsLoading(false);

      if (upMsg.length > 0 && upMsg[0].Hostel) {
        setCOSavailable(true);
      } else {
        setCOSavailable(false);
      }
      if (upMsg.length > 0 && upMsg[0].Skills && upMsg[0].Skills.length > 0) {
        setSkillsAvailable(true);
      } else {
        setSkillsAvailable(false);
      }




    });
    
    return unsubscribe;
  }, []);

  useEffect(() => {
    const msgQuery = query(collection(firestoreDB, 'postings'));
    const unsubscribe = onSnapshot(msgQuery, (QuerySnapshot) => {
      const upMsg = QuerySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPostings(upMsg.filter(post => post.User._id === user._id));
      setPostsLoading(false);
    });
    return unsubscribe;
  }, [user._id]);

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
    } else {
      console.log('Image selection canceled');
    }
  };

  const Settings =()=>{
    navigation.navigate("Settingsscreen")
  }




  const PostingCard = ({ post }) => {
    const isCurrentUserPost = post.User._id === user._id;

    return (
      <View className="rounded-xl right-2 w-[350px] flex py-2">
        <TouchableOpacity onPress={() => navigation.navigate("DetailsScreen", { post })}>
          <BlurView style={{ left: 20 }} className=" bg-slate-300 px-4 py-1 rounded-xl w-[350px] h-[150px] border-1 relative shadow " tint='extraLight' intensity={40} >
            <Image source={{ uri: post.User.profilePic }} resizeMode="cover" className="w-12 h-12 relative top-2" style={{ alignSelf: 'flex-end' }} />
            <Text className="text-black text-2xl p-2 capitalize font-extralight absolute top-10">{post.JobDetails}</Text>
            <Text style={{ top: 20 }} className="text-gray-500 p-2 capitalize text-xl absolute">
              {post.Location}
            </Text>
            <Text className="text-primaryButton  capitalize font-thin text-xl absolute bottom-2 left-2">{post.Type}</Text>
            <Text className="text-black font-thin capitalize text-base absolute bottom-2 right-2">Fixed Price / ₦{post.Budget}</Text>
          </BlurView>
        </TouchableOpacity>
      </View>
    );
  };


  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView  behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView className="p-4">
     

        <View className="" style={{ flexDirection: 'row', justifyContent: 'flex-end'}}>

        <TouchableOpacity onPress={Settings}>
    <MaterialIcons name='settings' size={30} color={'#268290'} />
  </TouchableOpacity>
</View>


        {isLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#268290" />
          </View>
        ) : (
          <>
            <View className="items-center mt-8">
              <View className="rounded-full p-1">
                <Image source={{ uri: user?.profilePic }} resizeMode="cover" style={{ width: 100, height: 100 }} />
              </View>

              <Text className="text-2xl font-bold pt-4">{user.fullName}</Text>
              <Text className="text-base font-bold text-gray-500">{user.email}</Text>
            </View>

            <View className="flex-row justify-between mt-4">
              <View className="items-center">
                <Text className="text-2xl">{jobCount}</Text>
                <Text className="text-gray-500">Jobs posted</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl">{allHires}</Text>
                <Text className="text-gray-500">Hires</Text>
              </View>
            </View>







            <View  className="w-full flex-row items-center mt-4" >
  <Text className="text-base text-gray-500">Course of study: <Text className="font-bold">{details.length > 0 && details[0].Hostel ? details[0].Hostel : '----'}</Text></Text>


{
  !COSavailable ? 

    <TouchableOpacity onPress={COSfunction}>
    <View className=" w-6 h-6 bg-primaryButton rounded-full flex items-center justify-center">
        <MaterialIcons name='edit' size={10} color={'#fff'} />
      </View>
      </TouchableOpacity>
      :
      (
''
      )

  
}

{
  NoCOs?
  <TouchableOpacity onPress={SendCOS}>
    <View className=" w-6 h-6 bg-primary rounded-full flex items-center justify-center">
        <MaterialIcons name='check' size={16} color={'#fff'} />
      </View>
      </TouchableOpacity>
      :
      (
''
      )


}


</View>

{
  NoCOs?
  <View className="mt-4">

  

   <Picker
   
   selectedValue={COS}
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
 </View>
 :
 ("")
 }















           
            <View className="mt-2 w-full flex-row items-center">
              <Text className="mt-5 font-semibold">About {user.fullName}</Text>

            {
              !Edit ?
              <TouchableOpacity onPress={EditAbout}>
              <View className="left-2 top-2 w-6 h-6 bg-primaryButton rounded-full flex items-center justify-center">
                  <MaterialIcons name='edit' size={10} color={'#fff'} />
                </View>
                </TouchableOpacity>
                :
                ""

            }
            

{
              Edit ?
              
             
                  
              <View className=" left-3 flex-row justify-between gap-x-4">

<TouchableOpacity onPress={CancelEdit}>
    <View>
      <View className="top-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
        <MaterialIcons name='cancel' size={16} color={'#fff'} />
      </View>
    </View>
  </TouchableOpacity>

  <TouchableOpacity onPress={SaveEdit}>
    <View>
      <View className="top-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
        <MaterialIcons name='check' size={16} color={'#fff'} />
      </View>
    </View>
  </TouchableOpacity>

  
</View>

              
                :
                ""

            }
   

            </View>
            {
  Edit ?
  (
    isSending ? (
      <View  style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator className="top-9" size="large" color="#268290" />
      </View>
    ) : (
      <TextInput
        className={`border rounded-2xl w-[360px]  px-4 py-9 flex-row items-center justify-between space-x-8 left-5 my-2 `}
        placeholder="Edit bio"
        multiline={true}
        onChangeText={HandleAboutChange}
        value={value}
        scrollEnabled={true}
      />
    )
  ) : (
    null
  )
}


           

            
            

            <View className="mt-4">
            
           

              {!Edit? <Text className="text-base font-thin">{details.length > 0 ? details[0].About : '- - - - -'}</Text>:("") }

              
            </View>


            {
              SkillsAvailable ? 
              <View className="mt-4" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {details.length > 0 && typeof details[0].Skills === 'string' && details[0].Skills.length > 0 && (
                details[0].Skills.split(', ').map((skill, index) => (
                  <View key={index} style={{ borderColor: "#268290", borderWidth: 1, borderRadius: 20, padding: 8, margin: 4 }}>
                    <Text className="capitalize">{skill}</Text>
                  </View>
                ))
              )}
            </View>
            :
            ("")

            }

{
              !SkillsAvailable ? 
              <View className="mt-4 w-full flex-row items-center" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <Text className="mt-5 font-semibold">Skills</Text>
              

              {
                !ActivateSkills?
                <TouchableOpacity onPress={setSkills}>

<View className="left-2 w-6 h-6 bg-primaryButton rounded-full flex items-center justify-center">
                  <MaterialIcons name='add' size={16} color={'#fff'} />
                </View>
                </TouchableOpacity>
                :("")
                
              }

{
                ActivateSkills?
                <TouchableOpacity onPress={SaveSkills}>

<View className="left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <MaterialIcons name='check' size={16} color={'#fff'} />
                </View>
                </TouchableOpacity>
                :("")
                
              }
                

                

            </View>
            :
            ("")

            }

            {
              ActivateSkills?
              <TextInput
              className={`border rounded-2xl w-[360px]  px-4 py-9 flex-row items-center justify-between space-x-8 left-5 my-2 `}             
         
              placeholder= "Coding, Graphic Design..."
             multiline={true}
             onChangeText={HandleAboutChange1}
             value={skills}
             scrollEnabled = {true}
           />:
           
           ("")
            }

            

            
              <View className="w-full flex-row items-center ">
                <Text className="mt-5 font-semibold">Portfolio</Text>
                <TouchableOpacity onPress={pickImage}>
                <View className="left-2 top-2 w-6 h-6 bg-primaryButton rounded-full flex items-center justify-center">
                  <MaterialIcons name='add' size={16} color={'#fff'} />
                </View>
                </TouchableOpacity>

              </View>
            

            {isUploading ? (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#268290" />
              </View>
            ) : (

              <View className="left-6" style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
                {details.length > 0 && details[0].images && Array.isArray(details[0].images) && details[0].images.length > 0 ? (
                  details[0].images.map((imageUri, index) => (
                    <View key={index}>

<TouchableOpacity onPress={() => handleImagePress(imageUri)}>
    <View>
      <View className="top-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
        <MaterialIcons name='cancel' size={16} color={'#fff'} />
      </View>
    </View>
  </TouchableOpacity>

                    <Image
                      className="border-2 rounded-3xl border-primaryButton"
                      key={index}
                      resizeMode="cover"
                      style={{ width: imageSize.width, height: imageSize.height, margin: 5 }}
                      source={{ uri: imageUri }}
                    />


                  </View>

                  ))
                ) : null}

                {portfolioImages.length > 0 ? (
                  portfolioImages.map((imageUri, index) => (
                    <View  key={index} >

                   <TouchableOpacity onPress={() => handleImagePress(imageUri)}>
    <View>
      <View className="top-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
        <MaterialIcons name='cancel' size={16} color={'#fff'} />
      </View>
    </View>
  </TouchableOpacity>

                    <Image
                      className="border-2 rounded-3xl border-primaryButton"
                      key={index}
                      resizeMode="cover"
                      style={{ width: imageSize.width, height: imageSize.height, margin: 5 }}
                      source={{ uri: imageUri }}

                    />
                     </View>
                  ))
                ) : null}

                {(!details.length || !(details[0].images && details[0].images.length > 0)) && portfolioImages.length === 0 ? (
                  <View className='right-5 w-full justify-center items-center'>
                    <Text className="italic font-extralight">Nothing on portfolio</Text>
                  </View>
                ) : null}
              </View>
            )}

            <View className="mt-4">
              <Text className="font-semibold">My Posts</Text>
              {postsLoading ? (
                <ActivityIndicator size="large" color="#268290" />
              ) : (
                <View className="right-1">
                  {postings.length > 0 ? (
                    postings.map((post, i) => (
                      <PostingCard key={i} post={post} />
                    ))
                  ) : (
                    <View className=' w-full justify-center items-center'>
                    <Text className="italic font-extralight">No jobs posted</Text>
                  </View>
                  )}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Profilescreen;
