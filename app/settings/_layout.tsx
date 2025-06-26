import { Slot, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../context/themeContext";

export default function SettingsLayout() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const isDarkMode = colorScheme === "dark";
  return (
    <View>
      <View className="justify-between items-center flex-row pt-1 border-b border-borderColor dark:border-borderDark absolute top-0 w-full px-6 h-20 dark:bg-backgroundDark bg-background">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()}>
            <ChevronLeft color={isDarkMode ? "white" : "black"} />
          </Pressable>
          <Text className="text-3xl ml-3 text-black dark:text-white font-urbanist-bold">
            Settings
          </Text>
        </View>
        <View className="px-6">
          <Text className="text-3xl text-primary font-sevillana-regular">
            Flash
          </Text>
        </View>
      </View>
      <View className="mt-20 dark:bg-backgroundDark bg-background">
        <Slot />
      </View>
    </View>
  );
}
