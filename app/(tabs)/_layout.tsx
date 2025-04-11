import { Slot } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <View>
      <Slot />
    </View>
  );
}
