import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Logo2 } from "../assets";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  QuerySnapshot,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { firestoreDB } from "../config/firebase.config";
import { Dimensions, PixelRatio } from "react-native";
import AppText from "@/components/AppText";
import { useSelector } from "react-redux";

const { width } = Dimensions.get("window");

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
  const [Chats, setChats] = useState([]);
  const [unreadMap, setUnreadMap] = useState({});
  const [latestMessages, setLatestMessages] = useState({}); // track latest per room

  // Load chats
  useLayoutEffect(() => {
    const chatQuery = query(
      collection(firestoreDB, "chats"),
      orderBy("_id", "desc")
    );

    const unsubscribe = onSnapshot(chatQuery, (querySnapshot) => {
      const chatRooms = querySnapshot.docs
        .map((doc) => doc.data())
        .filter((room) => room.index === user._id);
      setChats(chatRooms);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [user._id]);

  // Listen to messages to track latest per room & unread
  useEffect(() => {
    const msgQuery = query(
      collection(firestoreDB, "messages"),
      orderBy("timeStamp", "desc")
    );

    const unsubscribeMsgs = onSnapshot(msgQuery, (querySnapshot) => {
      const latestByRoom = {};

      querySnapshot.docs.forEach((d) => {
        const m = d.data();
        const roomId = m.idRoom;
        if (!latestByRoom[roomId]) latestByRoom[roomId] = m; // first = latest
      });

      // Update latest messages state
      setLatestMessages(latestByRoom);

      // Compute unread map
      const map = {};
      Object.keys(latestByRoom).forEach((roomId) => {
        const m = latestByRoom[roomId];
        const chat = (Chats || []).find(
          (r) => r.idRoom === roomId || r._id === roomId
        );
        const lastRead = chat?.lastRead?.[user._id];
        const lastReadMs = lastRead ? lastRead.seconds * 1000 : null;
        const latestMs = m?.timeStamp?.seconds ? m.timeStamp.seconds * 1000 : null;

        let unread = false;
        if (!latestMs) unread = false;
        else if (!lastReadMs) unread = !!(m?.user && m.user._id !== user._id);
        else unread = latestMs > lastReadMs && !!(m?.user && m.user._id !== user._id);

        map[roomId] = unread;
      });

      setUnreadMap(map);
    });

    return () => unsubscribeMsgs();
  }, [user._id, Chats]); // ✅ keep Chats here only to get lastRead info

  // Mark room read
  const markRoomRead = async (room) => {
    if (!room?._id) return;
    const chatRef = doc(firestoreDB, "chats", room._id);
    const nowSeconds = Math.floor(Date.now() / 1000);
    await setDoc(
      chatRef,
      { lastRead: { [user._id]: { seconds: nowSeconds, nanoseconds: 0 } } },
      { merge: true }
    );
  };

  // Message card
  const MessageCard = ({ room }) => {
    const isCurrentUserRoomCreator = user._id === room.index;
    const isNotCurrentUserJobPoster = user._id === room.index1;

    const roomKeyLocal = room.idRoom || room._id;

    return (
      <TouchableOpacity
        onPress={() => {
          markRoomRead(room);
          navigation.navigate("Chatscreen", { post: room });
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 10,
          paddingHorizontal: 20,
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#268290",
          borderRadius: 16,
          marginTop: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View
          style={{
            width: 60,
            height: 60,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#F0F0F0",
            borderRadius: 30,
            position: "relative",
          }}
        >
          <Image
            source={{
              uri: isCurrentUserRoomCreator ? room.user.profilePic : room.profilePic,
            }}
            resizeMode="contain"
            style={{ width: 50, height: 50, borderRadius: 25 }}
          />
          {unreadMap[roomKeyLocal] && (
            <View
              style={{
                position: "absolute",
                right: 6,
                top: 6,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: "#FF3B30",
                borderWidth: 2,
                borderColor: "#FFF",
              }}
            />
          )}
        </View>
        <View style={{ flex: 1, marginLeft: 20 }}>
          <View style={{ borderBottomWidth: 2, borderColor: "#D3D3D3" }}>
            <AppText
              style={{
                fontSize: scaleFont(18),
                color: "#333",
                fontWeight: !isNotCurrentUserJobPoster ? "bold" : "normal",
                textTransform: "capitalize",
              }}
              numberOfLines={1}
            >
              {isCurrentUserRoomCreator ? room.jobName : ""}
            </AppText>
          </View>

          <View
            style={{
              flexDirection: "row",
              borderTopWidth: 2,
              borderColor: "#D3D3D3",
              paddingTop: 5,
              flex: 1,
            }}
          >
            <AppText
              style={{
                fontSize: scaleFont(16),
                color: "#666",
                textTransform: "capitalize",
                flexShrink: 1,
                flex: 1,
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
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
                flex: 0,
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {!isNotCurrentUserJobPoster ? "Freelancer" : "Client"}
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <SafeAreaView edges={["top"]}>
        <ScrollView style={{ paddingHorizontal: 10, paddingTop: 10 }}>
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 10,
              }}
            >
              <AppText style={{ fontSize: 20, color: "#268290" }}>Messages</AppText>
            </View>

            {isLoading ? (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#268290" />
              </View>
            ) : Chats.length === 0 ? (
              <View className="items-center">
                <AppText>No messages</AppText>
              </View>
            ) : (
              <>
                {/* SORT HERE ON RENDER */}
                {[...Chats]
                  .sort((a, b) => {
                    const aTime = latestMessages[a.idRoom || a._id]?.timeStamp?.seconds || 0;
                    const bTime = latestMessages[b.idRoom || b._id]?.timeStamp?.seconds || 0;
                    return bTime - aTime; // newest first
                  })
                  .map((room) => (
                    <MessageCard key={room._id} room={room} />
                  ))}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
export default Messagescreen;
