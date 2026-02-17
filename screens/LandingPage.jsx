import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { NEW_LOGO } from "../assets";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useEvent } from "expo";


// expo-video imports
import { useVideoPlayer, VideoView } from "expo-video";

const LandingPage = () => {
  const navigation = useNavigation();

  const HandleLogin = () => {
    navigation.navigate("Loginscreen");
  };

const player = useVideoPlayer(require("../assets/Video.mp4"), (player) => {
  player.loop = false;
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
    <View className="flex-1 bg-gray-50 justify-center items-center px-6">

      {/* Logo + Title */}
      <Animated.View
        entering={FadeInDown.duration(750)}
        className="items-center w-full"
      >
    
        {/* Video */}
       
           <VideoView
          player={player}
          style={{ width: "100%", height: 440 }}
          pointerEvents="none"
        />


   
       
    
<Text className="text-center text-slate-400 text-sm mt-1">
  Student Talent Employment Platform
</Text>

        
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
          <Text className="text-white text-lg font-semibold tracking-wide">
             Start your journey
          </Text>
        </TouchableOpacity>

    
      </Animated.View>
    </View>
  );
};

export default LandingPage;
