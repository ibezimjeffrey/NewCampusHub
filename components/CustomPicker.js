import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "../components/AppText";

const { width } = Dimensions.get("window");

const CustomPicker = ({ label, value, options, onSelect }) => {
  const [visible, setVisible] = useState(false);
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Find the label of the currently selected value
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.9);
      opacity.setValue(0);
    }
  }, [visible]);

  return (
    <>
      {/* Input */}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setVisible(true)}
        activeOpacity={0.85}
      >
        <AppText style={styles.value}>
          {selectedOption ? selectedOption.label : label}
        </AppText>
        <MaterialIcons name="keyboard-arrow-down" size={22} color="#666" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal transparent visible={visible} animationType="none">
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          {Platform.OS === "ios" ? (
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={styles.androidBlur} />
          )}

          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ scale }],
                opacity,
              },
            ]}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const selected = item.value === value;
                return (
                  <TouchableOpacity
                    style={[styles.option, selected && styles.selected]}
                    onPress={() => {
                      onSelect(item.value); // Keep value as the bank code
                      setVisible(false);
                    }}
                  >
                    <AppText style={[styles.optionText, selected && styles.selectedText]}>
                      {item.label} {/* Display the label */}
                    </AppText>
                    {selected && (
                      <MaterialIcons name="check-circle" size={20} color="#268290" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    width: width - 40,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginVertical: 10,
  },
  value: {
    fontSize: 15,
    color: "#111",
    fontWeight: "500",
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  androidBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  card: {
    width: width - 60,
    maxHeight: "60%",
    backgroundColor: "#fff",
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selected: {
    backgroundColor: "#26829020",
  },
  optionText: {
    fontSize: 15,
    color: "#222",
  },
  selectedText: {
    color: "#268290",
    fontWeight: "600",
  },
});

export default CustomPicker;
