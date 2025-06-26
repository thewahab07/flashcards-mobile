import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../context/themeContext";

const Notifications = () => {
  const { colorScheme } = useTheme();
  const isDarkMode = colorScheme === "dark";

  return (
    <View className="w-full h-full px-6">
      <View className="w-full items-center space-y-2">
        <Text className="text-black dark:text-white font-urbanist-medium text-xl mt-4">
          Under Construction, Wait for the next update.
        </Text>
      </View>
    </View>
  );
};

export default Notifications;
