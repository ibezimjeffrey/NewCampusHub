import React from "react";
import { Text, Dimensions, PixelRatio, Platform } from "react-native";

const { width } = Dimensions.get("window");

// Base width for iPhone X / standard 375pt
const guidelineBaseWidth = 375;

// Scales font size based on device width
const scale = (size) => (width / guidelineBaseWidth) * size;

// Prevent Android from using system font scaling
const normalize = (size) => {
  const newSize = scale(size);
  return Platform.OS === "ios"
    ? Math.round(PixelRatio.roundToNearestPixel(newSize))
    : Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2; // slight adjustment for Android
};

export default function AppText({ style, children, fontSize = 16, ...props }) {
  return (
    <Text
      style={[{ fontFamily: "inter", fontSize: normalize(fontSize) }, style]}
      allowFontScaling={false}  // <-- ensures Android ignores system font size
      {...props}
    >
      {children}
    </Text>
  );
}
