import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
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
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const status = emailRegex.test(text);
      setisEmailValid(status);
      setgetEmailValidationStatus(status);
    }
  };

  return (
    <View className={`border rounded-2xl px-4 py-9 flex-row items-center justify-between space-x-4 my-2 ${!isEmailValid && Placeholder === "Email" && value.length > 0 ? "border-red-500" : "border-gray-200"}`}>
      <MaterialIcons name={icon} size={24} color={"#6c6c6c"} />
      <TextInput
        className="flex-1 text-primaryText font-semibold -mt-1"
        placeholder={Placeholder}
        value={value}
        onChangeText={handleTextChange}
        secureTextEntry={isPass && showPass}
      />
      {isPass && (
        <TouchableOpacity onPress={() => setshowPass(!showPass)}>
          <Entypo name={`${showPass ? 'eye' : 'eye-with-line'}`} size={24} color={"#6c6c6c"} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Userinput;
