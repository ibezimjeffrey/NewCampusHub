import React, { useState, useEffect } from "react";
import { Dimensions,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { firebaseAuth, firestoreDB } from "../config/firebase.config";
import { useNavigation } from "@react-navigation/native";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Picker } from "@react-native-picker/picker";

import FancyTextInput from "@/components/FancyTextInput";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import CustomPicker from "@/components/CustomPicker";
import AppText from "@/components/AppText";

const { width } = Dimensions.get("window");
const scaleFont = (baseFont) => {
  if (width <= 320) return baseFont * 0.8; // very small phones
  if (width <= 375) return baseFont * 0.9; // small phones
  return baseFont; // normal phones
};

const Profilescreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [value, setvalue] = useState("");
  const [Edit, setEdit] = useState(false);
  const [jobCount, setJobCount] = useState(0);
  const [allHires, setAllHires] = useState(0);
  const [postings, setPostings] = useState([]);
  const [details, setDetails] = useState("");
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
  const [COS, setCOS] = useState("");
  const [NoCOs, setNoCOs] = useState(false);
  const [COSavailable, setCOSavailable] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 100, height: 100 });
  const CLOUDINARY_URL =
    "https://api.cloudinary.com/v1_1/dmtgcnjxv/image/upload";
  const CLOUDINARY_UPLOAD_PRESET = "umdj7bkg";
  const [SkillsAvailable, setSkillsAvailable] = useState(false);
  const [ActivateSkills, setActivateSkills] = useState(false);
  const [skills, setskills] = useState("");

  const sendImage = async (imageUri) => {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "photo.jpg",
    });
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      setIsUploading(true); // Start uploading
      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
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
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Image Uploaded",
        textBody: " Your image has been uploaded successfully.",
      });
      console.log("Image sent");
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Upload Failed",
        textBody: " Failed to upload image. Please try again.",
      });
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

  const setSkills = () => {
    setActivateSkills(true);
  };

  const SaveSkills = async () => {
    if (skills.length > 0) {
      setActivateSkills(false);
      try {
        let docRef;
        let existingSkills = [];

        // Get existing skills from details
        if (details.length > 0 && details[0].Skills) {
          existingSkills = details[0].Skills.split(",").map((s) => s.trim());
        }

        // New skills from input
        const newSkillsArray = skills.split(",").map((s) => s.trim());

        // Combine old and new skills, removing duplicates
        const combinedSkills = Array.from(
          new Set([...existingSkills, ...newSkillsArray]),
        );

        if (details.length === 0) {
          // If no document exists, create a new one
          docRef = await addDoc(
            collection(firestoreDB, "users", user._id, "details"),
            {
              Skills: combinedSkills.join(", "),
              _id: user._id,
            },
          );
        } else {
          // Update existing document
          docRef = doc(
            firestoreDB,
            "users",
            user._id,
            "details",
            details[0].id,
          );
          await updateDoc(docRef, { Skills: combinedSkills.join(", ") });
        }

        // Update local state
        setDetails((prevDetails) => {
          const newDetails = [...prevDetails];
          if (newDetails.length === 0) {
            newDetails.push({
              id: docRef.id,
              Skills: combinedSkills.join(", "),
            });
          } else {
            newDetails[0].Skills = combinedSkills.join(", ");
          }
          return newDetails;
        });

        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Skills Added",
          textBody: "Action completed",
        });

        setSkillsAvailable(true);
        setskills(""); // clear input after saving
      } catch (error) {
        console.error("Error updating document: ", error);
        Toast.show({
          type: ALERT_TYPE.WARNING,
          title: "Error saving changes",
          textBody: "There has been an error. Try again later",
        });
      }
    } else {
      setActivateSkills(false);
    }
  };

  const SaveEdit = async () => {
    if (value.length > 0) {
      try {
        setIsSending(true);

        let docRef;
        if (details.length === 0) {
          // If details collection doesn't exist for user, create a new document
          docRef = await addDoc(
            collection(firestoreDB, "users", user._id, "details"),
            { About: value, _id: user._id },
          );
        } else {
          // Update the existing document
          docRef = doc(
            firestoreDB,
            "users",
            user._id,
            "details",
            details[0].id,
          );
          await updateDoc(docRef, { About: value });
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
        setIsSending(false);
        alert("Bio successfully updated");
        setvalue("");
        setEdit(false);
      } catch (error) {
        console.error("Error updating document: ", error);
        alert("Error saving changes");
      }
    } else {
      CancelEdit();
    }
  };

  const COSfunction = () => {
    if (NoCOs == false) {
      setNoCOs(true);
      setCOSavailable(true);
    }

    if (NoCOs == true) {
      setNoCOs(false);
      setCOSavailable(false);
    }
  };

  const SendCOS = async () => {
    if (COS.length > 0) {
      setNoCOs(false);
      try {
        let docRef;
        if (details.length === 0) {
          // If details collection doesn't exist for user, create a new document
          docRef = await addDoc(
            collection(firestoreDB, "users", user._id, "details"),
            { Hostel: COS, _id: user._id },
          );
        } else {
          // Update the existing document
          docRef = doc(
            firestoreDB,
            "users",
            user._id,
            "details",
            details[0].id,
          );
          await updateDoc(docRef, { Hostel: COS });
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
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Course of Study Updated",
          textBody: " Your Course of Study has been updated successfully.",
        });
      } catch (error) {
        console.error("Error updating document: ", error);
        alert("Error saving changes");
      }
    } else {
      COSfunction();
    }
  };

  const CancelEdit = () => {
    setEdit(false);
    setvalue("");
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
      navigation.replace("Loginscreen");
    });
  };

  const deleteImage = async (imageUri) => {
    try {
      // Delete image from the portfolio collection
      setIsUploading(true);
      const imageQuery = query(
        collection(firestoreDB, "portfolio"),
        where("image", "==", imageUri),
      );
      const querySnapshot = await getDocs(imageQuery);
      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        setPortfolioImages((prevImages) =>
          prevImages.filter((img) => img !== imageUri),
        );
        alert("Image deleted");
        setIsUploading(false);
      } else {
        ("");
      }

      // Delete image from the details collection
      const detailsQuery = query(
        collection(firestoreDB, "users", user._id, "details"),
      );
      const detailsSnapshot = await getDocs(detailsQuery);
      if (!detailsSnapshot.empty) {
        detailsSnapshot.forEach(async (doc) => {
          const docData = doc.data();
          if (
            docData.images &&
            Array.isArray(docData.images) &&
            docData.images.includes(imageUri)
          ) {
            const updatedImages = docData.images.filter(
              (img) => img !== imageUri,
            );
            await updateDoc(doc.ref, { images: updatedImages });
            setDetails((prevDetails) => {
              const newDetails = [...prevDetails];
              const index = newDetails.findIndex((d) => d.id === doc.id);
              if (index !== -1) {
                newDetails[index].images = updatedImages;
              }
              return newDetails;
            });
            Alert.alert(
              "Image Deleted",
              "The image has been successfully deleted",
            );
          }
        });
      } else {
        ("");
      }
    } catch (error) {
      console.error("Error deleting image: ", error);
      Alert.alert("Error", "Failed to delete image.");
    }
  };

  const deleteSkill = async (Skill) => {
    try {
      if (details.length === 0) return;

      const docRef = doc(
        firestoreDB,
        "users",
        user._id,
        "details",
        details[0].id,
      );

      // Split current skills into array
      const currentSkills = details[0].Skills
        ? details[0].Skills.split(",").map((s) => s.trim())
        : [];

      // Remove the skill
      const updatedSkills = currentSkills.filter((s) => s !== Skill);

      // Update Firestore
      await updateDoc(docRef, { Skills: updatedSkills.join(", ") });

      // Update local state
      setDetails((prevDetails) => {
        const newDetails = [...prevDetails];
        newDetails[0].Skills = updatedSkills.join(", ");
        return newDetails;
      });

      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Skill Deleted",
        textBody: `The skill "${Skill}" has been removed`,
      });
    } catch (error) {
      console.error("Error deleting skill: ", error);
      Alert.alert("Error", "Failed to delete skill.");
    }
  };

  const handleImagePress = (imageUri) => {
    deleteImage(imageUri);
  };

  const handleSkillPress = (Skill) => {
    deleteSkill(Skill);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(firestoreDB, "Status"),
        where("receipient._id", "==", user._id),
      ),
      (querySnapshot) => {
        setAllHires(querySnapshot.docs.length);
      },
    );
    return unsubscribe;
  }, [user._id]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(firestoreDB, "portfolio"),
        where("user._id", "==", user._id),
      ),
      (querySnapshot) => {
        const images = querySnapshot.docs.map((doc) => doc.data().image);
        setPortfolioImages(images);
        console.log(images.length > 0);
        setFinish(false);
      },
    );
    return unsubscribe;
  }, [user._id]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(firestoreDB, "AllPostings"),
        where("User._id", "==", user._id),
      ),
      (querySnapshot) => {
        setJobCount(querySnapshot.docs.length);
      },
    );
    return unsubscribe;
  }, [user._id]);

  useEffect(() => {
    const msgQuery = query(
      collection(firestoreDB, "users", user._id, "details"),
    );
    const unsubscribe = onSnapshot(msgQuery, (querySnapshot) => {
      const upMsg = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
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
    const msgQuery = query(
      collection(firestoreDB, "postings"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(msgQuery, (QuerySnapshot) => {
      const upMsg = QuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPostings(upMsg.filter((post) => post.User._id === user._id));
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
      setSelectedImages((prevImages) => [...prevImages, imageUri]);
      sendImage(imageUri);
    } else {
      console.log("Image selection canceled");
    }
  };

  const Settings = () => {
    navigation.navigate("Settingsscreen");
  };

  const DeleteAccount = () => {
    Alert.alert(
      "Delete account",
      "This will permanently delete your account and all associated data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsApplying(true);
            try {
              // helper to delete docs from a query
              const deleteQueryDocs = async (q) => {
                const snap = await getDocs(q);
                if (!snap.empty) {
                  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
                }
              };

              // delete portfolio items
              await deleteQueryDocs(
                query(
                  collection(firestoreDB, "portfolio"),
                  where("user._id", "==", user._id),
                ),
              );

              // delete all postings made by user
              await deleteQueryDocs(
                query(
                  collection(firestoreDB, "AllPostings"),
                  where("User._id", "==", user._id),
                ),
              );

              // delete postings collection entries by user (if any)
              await deleteQueryDocs(
                query(
                  collection(firestoreDB, "postings"),
                  where("User._id", "==", user._id),
                ),
              );

              // delete status documents where user is recipient
              await deleteQueryDocs(
                query(
                  collection(firestoreDB, "Status"),
                  where("receipient._id", "==", user._id),
                ),
              );

              // delete user's details subcollection documents
              const detailsCollection = collection(
                firestoreDB,
                "users",
                user._id,
                "details",
              );
              const detailsSnap = await getDocs(detailsCollection);
              if (!detailsSnap.empty) {
                await Promise.all(
                  detailsSnap.docs.map((d) => deleteDoc(d.ref)),
                );
              }

              // attempt to delete firebase auth user
              const currentUser = firebaseAuth.currentUser;
              if (currentUser) {
                try {
                  await currentUser.delete();
                } catch (err) {
                  // deletion may fail if user needs recent auth
                  if (err.code === "auth/requires-recent-login") {
                    Alert.alert(
                      "Re-authentication required",
                      "Please sign out and sign in again before deleting your account.",
                    );
                    // fallback: sign the user out and clear local state
                    await firebaseAuth.signOut();
                  } else {
                    throw err;
                  }
                }
              }

              navigation.replace("Loginscreen");
            } catch (error) {
              console.error("Error deleting account:", error);
            } finally {
              setIsApplying(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const PostingCard = ({ post }) => {
    const isCurrentUserPost = post.User._id === user._id;

    return (
      <View className="rounded-xl flex py-2">
        <TouchableOpacity
          onPress={() => navigation.navigate("DetailsScreen", { post })}
        >
          <View
            style={{ width: width - 40, paddingVertical: 10 }}
            className=" bg-slate-200 px-4 py-1  rounded-xl h-[150px] border-1 relative shadow "
          >
            <Image
              source={{ uri: post.User.profilePic }}
              resizeMode="cover"
              className="w-12 h-12 relative top-2"
              style={{ alignSelf: "flex-end" }}
            />
            <AppText
              style={{
                color: "#6b7280", // gray-500
                fontSize: scaleFont(16), // was text-xl
                padding: 8,
                textTransform: "capitalize",
                position: "absolute",
                marginTop: 70,
              }}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.75}
            >
              {post.Location}
            </AppText>

            <AppText
              style={{
                color: "#000",
                fontSize: 20, // was text-2xl
              
                padding: 8,
                textTransform: "capitalize",
                position: "absolute",
                top: 40,
              }}
              numberOfLines={2} // prevents overflow
              adjustsFontSizeToFit={true}
              minimumFontScale={0.7}
            >
              {post.JobDetails}
            </AppText>

            <View style={{ flex: 1, justifyContent: "flex-end" }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <AppText
                  style={{
                    color: "#268290",
                   
                    fontSize: scaleFont(16),
                    flexShrink: 1, // allows shrinking on small screens
                  }}
                  numberOfLines={1} // prevents wrapping
                >
                  {post.DisplayTime}
                </AppText>

                <AppText
                  style={{
                    color: "#000",
                   
                    fontSize: scaleFont(14),
                    flexShrink: 1, // allows shrinking
                    textAlign: "right",
                  }}
                  numberOfLines={1}
                >
                  Fixed Price / ₦{post.Budget}
                </AppText>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
      
    <SafeAreaView edges={["top"]} className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
         <ScrollView
            contentContainerStyle={{ padding: 20 }}
              showsVerticalScrollIndicator={false}
              
            >
          <View className="w-full flex-row justify-between">
            <View
              className=""
              style={{ flexDirection: "row", justifyContent: "flex-end" }}
            >
              <TouchableOpacity onPress={DeleteAccount}>
                <MaterialIcons
                  name="delete-forever"
                  size={30}
                  color={"#FF0000"}
                />
              </TouchableOpacity>
            </View>

            <View
              className=""
              style={{ flexDirection: "row", justifyContent: "flex-start" }}
            >
              <TouchableOpacity onPress={Settings}>
                <MaterialIcons name="settings" size={30} color={"#268290"} />
              </TouchableOpacity>
            </View>
          </View>

          {isLoading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#268290" />
            </View>
          ) : (
            <>
              <View className="items-center mt-8">
                <View className="rounded-full p-1">
                  <Image
                    source={{ uri: user?.profilePic }}
                    resizeMode="cover"
                    style={{ width: 100, height: 100 }}
                  />
                </View>

                <AppText className="text-2xl font-bold pt-4">{user.fullName}</AppText>
                <AppText className="text-base font-bold text-gray-500">
                  {user.email}
                </AppText>
              </View>

              <View className="mt-5 mb-4">
                <View className="flex-row justify-between mt-4">
                  <View className="items-center">
                    <AppText className="text-2xl">{jobCount}</AppText>
                    <AppText className="text-gray-500">Jobs posted</AppText>
                  </View>
                  <View className="items-center">
                    <AppText className="text-2xl">{allHires}</AppText>
                    <AppText className="text-gray-500">Hires</AppText>
                  </View>
                </View>
              </View>

              <View className="w-full flex-row items-center mt-4">
                <View className="mt-1 px-4">
                  <View className="relative rounded-3xl bg-white p-5 shadow-lg border border-gray-100">
                    {/* Accent bar */}
                    <View
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 20,
                        bottom: 20,
                        width: 4,
                        backgroundColor: "#268290",
                        borderRadius: 10,
                      }}
                    />

                    {/* Header */}
                    <AppText
                      style={{
                        fontSize: 12,
                        letterSpacing: 2,
                        color: "#268290",
                       
                        marginBottom: 10,
                        marginLeft: 8,
                      }}
                    >
                      COURSE OF STUDY
                    </AppText>

                    {/* Value */}
                    <AppText
                      style={{
                        fontSize: 16,
                        color: "#111",
                       
                        marginLeft: 8,
                        textTransform: "capitalize",
                      }}
                    >
                      {details.length > 0 && details[0].Hostel
                        ? details[0].Hostel
                        : "Not specified"}
                    </AppText>
                  </View>
                </View>

                {!COSavailable ? (
                  <TouchableOpacity onPress={COSfunction}>
                    <View className=" w-6 h-6 bg-primaryButton rounded-full flex items-center justify-center">
                      <MaterialIcons name="edit" size={10} color={"#fff"} />
                    </View>
                  </TouchableOpacity>
                ) : (
                  ""
                )}

                {NoCOs ? (
                  <TouchableOpacity onPress={SendCOS}>
                    <View className=" w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <MaterialIcons name="check" size={16} color={"#fff"} />
                    </View>
                  </TouchableOpacity>
                ) : (
                  ""
                )}
              </View>

              {NoCOs ? (
                <View className="mt-4">
                  <CustomPicker
                    label="Select your course"
                    value={COS}
                    onSelect={(itemValue) => handleTextChange(itemValue)}
                    options={[
                      {
                        label: "Mass Communication",
                        value: "Mass Communication",
                      },
                      { label: "ISMS", value: "ISMS" },
                      {
                        label: "Mechanical Engineering",
                        value: "Mechanical Engineering",
                      },
                      {
                        label: "Business Administration",
                        value: "Business Administration",
                      },
                      { label: "Computer Science", value: "Computer Science" },
                      {
                        label: "Electrical Engineering",
                        value: "Electrical Engineering",
                      },
                      { label: "Finance", value: "Finance" },
                    ]}
                  />
                </View>
              ) : (
                ""
              )}

              <View className="mt-2 w-full flex-row items-center">
                {Edit ? (
                  <View className=" left-3 flex-row justify-between gap-x-4">
                    <TouchableOpacity onPress={CancelEdit}>
                      <View>
                        <View className="top-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                          <MaterialIcons
                            name="cancel"
                            size={16}
                            color={"#fff"}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={SaveEdit}>
                      <View>
                        <View className="top-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <MaterialIcons
                            name="check"
                            size={16}
                            color={"#fff"}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : (
                  ""
                )}
              </View>
              {Edit ? (
                isSending ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ActivityIndicator
                      className="top-9"
                      size="large"
                      color="#268290"
                    />
                  </View>
                ) : (
                  <FancyTextInput
                    className={`border rounded-2xl w-[360px]  px-4 py-9 flex-row items-center justify-between space-x-8 left-5 my-2 `}
                    placeholder="Edit bio"
                    multiline={true}
                    onChangeText={HandleAboutChange}
                    value={value}
                    scrollEnabled={true}
                  />
                )
              ) : null}

              <View className="mt-2 px-4">
                {!Edit && (
                  <View className="relative rounded-3xl bg-white p-5 shadow-lg border border-gray-100">
                    {/* Accent bar */}
                    <View
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 20,
                        bottom: 20,
                        width: 4,
                        backgroundColor: "#268290",
                        borderRadius: 10,
                      }}
                    />

                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-2">
                      <AppText
                        style={{
                          fontSize: 12,
                          letterSpacing: 2,
                          color: "#268290",
                          
                          marginBottom: 12,
                          marginLeft: 8,
                        }}
                      >
                        ABOUT ME
                      </AppText>
                      {!Edit ? (
                        <TouchableOpacity
                          className=" w-6 h-6 bg-primaryButton rounded-full flex items-center justify-center"
                          onPress={EditAbout}
                        >
                          <View>
                            <MaterialIcons
                              name="edit"
                              size={10}
                              color={"#fff"}
                            />
                          </View>
                        </TouchableOpacity>
                      ) : (
                        ""
                      )}
                    </View>

                    {/* Content */}
                    {details.length > 0 && details[0].About ? (
                      <AppText
                        style={{
                          fontSize: 16,
                          lineHeight: 24,
                          color: "#111",
                          
                          marginLeft: 8,
                        }}
                      >
                        {details[0].About}
                      </AppText>
                    ) : (
                      <AppText
                        style={{
                          fontSize: 14,
                          fontStyle: "italic",
                          color: "#9ca3af",
                          marginLeft: 8,
                        }}
                      >
                        No bio yet — this is where personality lives.
                      </AppText>
                    )}
                  </View>
                )}
              </View>

              <View
                style={{
                  height: 1, // thickness of the line
                  width: "100%", // full width
                  backgroundColor: "#d1d5db", // light gray color
                  marginTop: 20,
                }}
              />

              <View className="w-full flex-row items-center ">
                <AppText className="mt-5 font-semibold">Skills</AppText>
                <TouchableOpacity onPress={setSkills}>
                  <View className="w-6 h-6 top-2 left-2 bg-primaryButton rounded-full flex items-center justify-center">
                    <MaterialIcons name="add" size={16} color={"#fff"} />
                  </View>
                </TouchableOpacity>
              </View>

              {SkillsAvailable ? (
                <View
                  className="mt-4"
                  style={{ flexDirection: "row", flexWrap: "wrap" }}
                >
                  {details.length > 0 &&
                    typeof details[0].Skills === "string" &&
                    details[0].Skills.length > 0 &&
                    details[0].Skills.split(", ").map((skill, index) => (
                      <View key={index}>
                        <TouchableOpacity
                          onPress={() => handleSkillPress(skill)}
                        >
                          <View>
                            <View className="top-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                              <MaterialIcons
                                name="cancel"
                                size={16}
                                color={"#fff"}
                              />
                            </View>
                          </View>
                        </TouchableOpacity>

                        <View
                          style={{
                            borderColor: "#268290",
                            borderWidth: 1,
                            borderRadius: 20,
                            padding: 8,
                            margin: 4,
                          }}
                        >
                          <AppText className="capitalize">{skill}</AppText>
                        </View>
                      </View>
                    ))}
                </View>
              ) : (
                ""
              )}

              {ActivateSkills ? (
                <View style={{ position: "relative", marginTop: 8 }}>
                  {/* Text Input */}
                  <FancyTextInput
                    style={{
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderRadius: 20,
                      paddingLeft: 16,
                      paddingRight: 48, // space for button
                      height: 50,
                    }}
                    placeholder="Coding, Graphic Design..."
                    multiline={false} // IMPORTANT: multiline breaks vertical centering
                    onChangeText={HandleAboutChange1}
                    value={skills}
                  />

                  {/* Button INSIDE input */}
                  <TouchableOpacity
                    onPress={SaveSkills}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: [{ translateY: -12 }],
                    }}
                  >
                    <MaterialIcons name="check" size={24} color="#268290" />
                  </TouchableOpacity>
                </View>
              ) : null}

              <View
                style={{
                  height: 1, // thickness of the line
                  width: "100%", // full width
                  backgroundColor: "#d1d5db", // light gray color
                  marginTop: 20,
                }}
              />

              <View className="w-full flex-row items-center ">
                <AppText className="mt-5 font-semibold">Portfolio</AppText>
                <TouchableOpacity onPress={pickImage}>
                  <View className="left-2 top-2 w-6 h-6 bg-primaryButton rounded-full flex items-center justify-center">
                    <MaterialIcons name="add" size={16} color={"#fff"} />
                  </View>
                </TouchableOpacity>
              </View>

              {isUploading ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator size="large" color="#268290" />
                </View>
              ) : (
                <View
                  className="left-6"
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginTop: 10,
                  }}
                >
                  {details.length > 0 &&
                  details[0].images &&
                  Array.isArray(details[0].images) &&
                  details[0].images.length > 0
                    ? details[0].images.map((imageUri, index) => (
                        <View key={index}>
                          <TouchableOpacity
                            onPress={() => handleImagePress(imageUri)}
                          >
                            <View>
                              <View className="top-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                                <MaterialIcons
                                  name="cancel"
                                  size={16}
                                  color={"#fff"}
                                />
                              </View>
                            </View>
                          </TouchableOpacity>

                          <Image
                            className="border-2 rounded-3xl border-primaryButton"
                            key={index}
                            resizeMode="cover"
                            style={{
                              width: imageSize.width,
                              height: imageSize.height,
                              margin: 5,
                            }}
                            source={{ uri: imageUri }}
                          />
                        </View>
                      ))
                    : null}

                  {portfolioImages.length > 0
                    ? portfolioImages.map((imageUri, index) => (
                        <View key={index}>
                          <TouchableOpacity
                            onPress={() => handleImagePress(imageUri)}
                          >
                            <View>
                              <View className="top-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                                <MaterialIcons
                                  name="cancel"
                                  size={16}
                                  color={"#fff"}
                                />
                              </View>
                            </View>
                          </TouchableOpacity>

                          <Image
                            className="border-2 rounded-3xl border-primaryButton"
                            key={index}
                            resizeMode="cover"
                            style={{
                              width: imageSize.width,
                              height: imageSize.height,
                              margin: 5,
                            }}
                            source={{ uri: imageUri }}
                          />
                        </View>
                      ))
                    : null}

                  {(!details.length ||
                    !(details[0].images && details[0].images.length > 0)) &&
                  portfolioImages.length === 0 ? (
                    <View className="right-5 w-full justify-center items-center">
                      <AppText className="italic font-extralight">
                        Nothing on portfolio
                      </AppText>
                    </View>
                  ) : null}
                </View>
              )}

<AppText className="mt-4 font-semibold">My Posts</AppText>
              <View className="mt-4 items-center justify-center flex-row flex-wrap">
                
                {postsLoading ? (
                  <ActivityIndicator size="large" color="#268290" />
                ) : (
                  <View className="right-1">
                    {postings.length > 0 ? (
                      postings.map((post, i) => (
                        <PostingCard key={i} post={post} />
                      ))
                    ) : (
                      <View className=" w-full justify-center items-center">
                        <AppText className="italic font-extralight">
                          No jobs posted
                        </AppText>
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
