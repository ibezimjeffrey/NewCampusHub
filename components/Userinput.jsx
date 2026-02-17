import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Entypo, MaterialIcons } from '@expo/vector-icons';

const Userinput = ({ Placeholder, isPass, setstateValue, setgetEmailValidationStatus }) => {
  const [value, setvalue] = useState(""); // Initialize state for input value
  const [showPass, setshowPass] = useState(true);
  const [icon, seticon] = useState(null);
  const [isEmailValid, setisEmailValid] = useState(false);

  useLayoutEffect(() => {
    switch (Placeholder) {
      case "Full Name":
        return seticon("person");
      case "Email":
        return seticon("email");
      case "Password":
        return seticon("lock");
    }
  }, []);

  const handleTextChange = (text) => {
    setvalue(text); // Update input value state
    setstateValue(text); // Pass the new value to the parent component

    if (Placeholder === "Email") {
    //  const emailRegex = /^([a-zA-Z]+\.?\d+@stu\.cu\.edu\.ng|[a-zA-Z0-9._%+-]+@pau\.edu\.ng|[a-zA-Z0-9._%+-]+@student\.babcock\.edu\.ng)$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


      const status = emailRegex.test(text);
      setisEmailValid(status);
      setgetEmailValidationStatus(status);
    }
  };

  return (
   <View style={{ position: 'relative', width: '100%' }}>
  {/* Left icon */}
  <MaterialIcons
    name={icon}
    size={22}
    color="#6c6c6c"
    style={{
      position: 'absolute',
      left: 14,
      top: '50%',
      transform: [{ translateY: -11 }],
      zIndex: 1,
    }}
  />

  <TextInput
   style={{fontFamily: "inter"}}

    className={`border h-[90] rounded-2xl text-primaryText font-inter px-12 py-4 my-2
      ${
        !isEmailValid &&
        Placeholder === 'Email' &&
        value.length > 0
          ? 'border-red-500'
          : 'border-gray-200'
      }`}
    placeholder={Placeholder}
    value={value}
    onChangeText={handleTextChange}
    secureTextEntry={isPass && showPass}
  />

  {/* Password toggle icon (right side) */}
  {isPass && (
    <TouchableOpacity
      style={{
        position: 'absolute',
        right: 14,
        top: '50%',
        transform: [{ translateY: -11 }],
      }}
      onPress={() => setshowPass(!showPass)}
    >
      <Entypo
        name={showPass ? 'eye' : 'eye-with-line'}
        size={22}
        color="#6c6c6c"
      />
    </TouchableOpacity>
  )}
</View>

  );
};
const styles = StyleSheet.create({
  input: {
    
    fontFamily: "inter",
 
  },
});

export default Userinput;
