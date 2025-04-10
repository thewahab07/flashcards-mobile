import { Slot } from "expo-router";
import React from "react";
import { View } from "react-native";
import BottomMenu from "@/components/BottomMenu";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  return (
    <SafeAreaView className="flex-1">
      <View>
        <Slot />
      </View>
      <BottomMenu />
    </SafeAreaView>
  );
}
