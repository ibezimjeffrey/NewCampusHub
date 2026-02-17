import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { NEW_LOGO } from "../assets";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useEvent } from "expo";
import AppText from "../components/AppText";


// expo-video imports
import { useVideoPlayer, VideoView } from "expo-video";
import { SafeAreaView } from "react-native-safe-area-context";

const LandingPage = () => {
  const navigation = useNavigation();

  const HandleLogin = () => {
    navigation.navigate("Loginscreen");
  };

const player = useVideoPlayer(require("../assets/Video.mp4"), (player) => {
  player.loop = false;
  player.muted = true;
});


const { isPlaying } = useEvent(player, "playingChange", {
  isPlaying: player.playing,
});

React.useEffect(() => {
  if (!isPlaying && player.currentTime >= player.duration && player.duration > 0) {
    const timer = setTimeout(() => {
      player.currentTime = 0;  // reset video
      player.play();
    }, 3000);

    return () => clearTimeout(timer);
  }
}, [isPlaying, player]);


  useFocusEffect(
  useCallback(() => {
    // When screen is focused
    player.play();

    return () => {
      // When screen is unfocused (navigating away)
      player.pause();
    };
  }, [player])
);


  return (
    <SafeAreaView className="flex-1 bg-gray-50">
    <View className="flex-1 bg-gray-50 justify-center items-center px-6">

      {/* Logo + Title */}
      <Animated.View
        entering={FadeInDown.duration(750)}
        className="items-center w-full"
      >
    
        {/* Video */}
        <View pointerEvents="none" style={{ width: "100%" }}>

   <VideoView
          player={player}
          fullscreenOptions={false}
          style={{ width: "100%", height: 440 }}
          pointerEvents="none"
           nativeControls={false}
            allowsVideoFrameAnalysis={false} 
           
        />


        </View>
       
        
   
       
    
<AppText className="text-center text-slate-400 text-sm mt-1">
  Student Talent Employment Platform
</AppText>

        
      </Animated.View>

      {/* Spacer */}
      <View className="h-16" />

      {/* Button Section */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(700)}
        className="w-full"
      >
        <TouchableOpacity
          onPress={HandleLogin}
          activeOpacity={0.85}
          className="bg-primaryButton py-4 rounded-2xl items-center shadow-lg"
        >
          <AppText className="text-white text-lg font-semibold tracking-wide">
             Start your journey
          </AppText>
        </TouchableOpacity>

    
      </Animated.View>
    </View>
    </SafeAreaView>
  );
};

export default LandingPage;
