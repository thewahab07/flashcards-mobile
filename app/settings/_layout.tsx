import { Slot, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function SettingsLayout() {
  const router = useRouter();
  return (
    <View>
      <View className="items-center flex-row pt-1 border-b border-[#ccc] absolute top-0 w-full px-6 h-20">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft color="black" />
        </Pressable>
        <Text className="text-3xl font-bold ml-3">Settings</Text>
      </View>
      <View className="mt-20">
        <Slot />
      </View>
    </View>
  );
}
