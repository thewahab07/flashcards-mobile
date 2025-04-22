import { Slot } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <View className="dark:bg-backgroundDark dark:text-white bg-background text-black">
      <Slot />
    </View>
  );
}
