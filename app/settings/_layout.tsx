import { Slot, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useWords } from "../context/globalContext";

export default function SettingsLayout() {
  const router = useRouter();
  const { isDarkMode } = useWords();
  return (
    <View>
      <View className="items-center flex-row pt-1 border-b border-borderColor absolute top-0 w-full px-6 h-20 dark:bg-backgroundDark bg-background">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft color={isDarkMode ? "white" : "black"} />
        </Pressable>
        <Text className="text-3xl font-bold ml-3 text-black dark:text-white">
          Settings
        </Text>
      </View>
      <View className="mt-20 dark:bg-backgroundDark bg-background">
        <Slot />
      </View>
    </View>
  );
}
