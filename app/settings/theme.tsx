import { Check, Monitor, Moon, Sun } from "lucide-react-native";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useWords } from "../context/globalContext";

const Theme = () => {
  const { themeMode, setThemeMode, isDarkMode } = useWords();
  const renderOption = (
    label: string,
    icon: JSX.Element,
    mode: "light" | "dark" | "system"
  ) => (
    <TouchableOpacity
      onPress={() => setThemeMode(mode)}
      className="w-full border-none shadow-none flex-row items-center justify-between py-5 px-4 rounded-xl"
    >
      <View className="flex-row items-center">
        {icon}
        <Text className="ml-2 text-lg font-medium text-black dark:text-white">
          {label}
        </Text>
      </View>
      {themeMode === mode && <Check color={isDarkMode ? "white" : "black"} />}
    </TouchableOpacity>
  );
  return (
    <View className="w-full h-full px-6">
      <View className="w-full items-center space-y-2">
        {renderOption(
          "Light",
          <Sun color={isDarkMode ? "white" : "black"} />,
          "light"
        )}
        <View className="border-y border-borderColor w-full">
          {renderOption(
            "Dark",
            <Moon color={isDarkMode ? "white" : "black"} />,
            "dark"
          )}
        </View>
        {renderOption(
          "System",
          <Monitor color={isDarkMode ? "white" : "black"} />,
          "system"
        )}
      </View>
    </View>
  );
};

export default Theme;
