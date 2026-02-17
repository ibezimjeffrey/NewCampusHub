import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import React, { useLayoutEffect, useState } from "react";
import { Logo2 } from "../assets";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { QuerySnapshot, collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { firestoreDB } from "../config/firebase.config";
import { Dimensions, PixelRatio } from 'react-native';
import AppText from "@/components/AppText";

const { width } = Dimensions.get('window');

// baseFont = font size you normally use
const scaleFont = (baseFont) => {
  // extremely small phones
  if (width <= 320) return baseFont * 0.75;
  // small phones
  if (width <= 360) return baseFont * 0.85;
  // medium phones
  if (width <= 375) return baseFont * 0.9;
  return baseFont; // normal & large phones
};



const Messagescreen = () => {
  const navigation = useNavigation();


  const user = useSelector((state) => state.user.user);



  const [isLoading, setIsLoading] = useState(true);
  const [Chats, setChats] = useState(null);

  const moveToAddChatScreen = () => {
    navigation.navigate("AddTochatscreen");
  };

  useLayoutEffect(() => {
    const chatQuery = query(collection(firestoreDB, "chats"), orderBy("_id", "desc"));
  
    const unsubscribe = onSnapshot(chatQuery, (querySnapshot) => {
      const chatRooms = querySnapshot.docs
        .map((doc) => doc.data())
        .filter((room) => room.index === user._id); 
      setChats(chatRooms);
      setIsLoading(false);
    });
  
    return unsubscribe;
  }, []);

  const MessageCard = ({ room }) => {
    const currentUser = useSelector((state) => state.user.user);
  
    const isCurrentUserRoomCreator = currentUser._id === room.index;
    const isNotCurrentUserJobPoster = currentUser._id === room.index1;
  
    return (
      <TouchableOpacity
  onPress={() => navigation.navigate("Chatscreen", { post: room })}
  style={{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#268290", // primaryButton
    borderRadius: 16,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }}
>
  {/* Profile Picture */}
  <View style={{
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 30
  }}>
    <Image
      source={{ uri: isCurrentUserRoomCreator ? room.user.profilePic : room.profilePic }}
      resizeMode="contain"
      style={{ width: 50, height: 50, borderRadius: 25 }}
    />
  </View>

  {/* Info */}
  <View style={{ flex: 1, marginLeft: 20 }}>
    {/* Job Name */}
    <View style={{ borderBottomWidth: 2, borderColor: "#D3D3D3" }}>
      <AppText
        style={{
          fontSize: scaleFont(18),
          color: "#333",
          fontWeight: !isNotCurrentUserJobPoster ? "bold" : "normal",
          textTransform: "capitalize",
        }}
        numberOfLines={1} // prevent overflow
      >
        {isCurrentUserRoomCreator ? room.jobName : ""} Job
      </AppText>
    </View>

    {/* User Name + Role */}
<View style={{ flexDirection: "row", borderTopWidth: 2, borderColor: "#D3D3D3", paddingTop: 5, flex: 1 }}>
  <AppText
    style={{
      fontSize: scaleFont(16),
      color: "#666",
      textTransform: "capitalize",
      flexShrink: 1,
      flex: 1,             // take remaining space
    }}
    numberOfLines={1}
    adjustsFontSizeToFit={true}  // SHRINK font to fit
    minimumFontScale={0.7}       // shrink up to 70% of original size
  >
    {isCurrentUserRoomCreator ? room.user.fullName : "Babby"}
  </AppText>

  <AppText
    style={{
      fontSize: scaleFont(16),
      color: "#268290",
      textTransform: "capitalize",
      marginLeft: 8,
      flexShrink: 1,
      flex: 0, // only take as much space as needed
    }}
    numberOfLines={1}
    adjustsFontSizeToFit={true} // SHRINK font if too long
    minimumFontScale={0.7}      // shrink up to 70% of original size
  >
    { !isNotCurrentUserJobPoster ? "Freelancer" : "Client" }
  </AppText>
</View>

    </View>

</TouchableOpacity>


    );
  };
  
  

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <SafeAreaView edges={['top']}>
        
       
        <ScrollView className="h-full" style={{ paddingHorizontal: 10, paddingTop: 10 }}>
          <View className="h-full">
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 10 }}>
              <AppText style={{ fontSize: 20, color: "#268290" }}>Messages</AppText>
             
            </View>
            {isLoading ? (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#268290" />
              </View>
            ) : (
              <>
                {Chats && Chats.length > 0 ? (
                  <>
                    {Chats.map((room, index) => <MessageCard key={index} room={room} />)}
                  </>
                ) : (
                  <View className="items-center">
                    <AppText >No messages</AppText>

                  </View>
                  
                )}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
  },
  logo: {
    width: 1000,
    height: 50,
  },
});

export default Messagescreen;
