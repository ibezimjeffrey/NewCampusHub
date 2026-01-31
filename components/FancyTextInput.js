import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, Text, Animated, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const FancyTextInput = ({
  label,
  value,
  onChangeText,
  multiline = false,
  placeholder = "",
  keyboardType = "default",
  returnKeyType,           // 👈 extract it
  onSubmitEditing,         // 👈 extract it
  ...props
}) => {

  const [isFocused, setIsFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(50); // dynamic height for multiline
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const labelStyle = {
    position: "absolute",
    left: 18,
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -8],
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["#999", "#268290"],
    }),
    backgroundColor: "#fff",
    paddingHorizontal: 4,
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
     <TextInput
  style={[
    styles.input,
    {
      borderColor: isFocused ? "#268290" : "#ccc",
      height: Math.max(50, inputHeight),
      textAlignVertical: multiline ? "top" : "center",
    },
  ]}
  value={value}
  onChangeText={onChangeText}
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
  multiline={multiline}
  keyboardType={keyboardType}
  placeholder={placeholder}

  blurOnSubmit={!multiline}
  returnKeyType={returnKeyType || "done"}   // ✅ GUARANTEED STRING
  onSubmitEditing={onSubmitEditing}

  onContentSizeChange={(event) =>
    multiline &&
    setInputHeight(event.nativeEvent.contentSize.height + 16)
  }
/>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 40,
    alignSelf: "center",
    marginVertical: 12,
    position: "relative",
  },
  input: {
    width: "100%",
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 18,
    fontSize: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    paddingVertical: 8,
  },
});

export default FancyTextInput;
