import { Check, Moon, Sun } from "lucide-react-native";
import React, { JSX } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useColorScheme } from "nativewind";
import { useTheme } from "../../context/themeContext";

const Theme = () => {
  const { theme, setTheme, colorScheme } = useTheme();
  const { toggleColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const renderOption = (
    label: string,
    icon: JSX.Element,
    mode: "light" | "dark"
  ) => (
    <TouchableOpacity
      disabled={theme === mode}
      onPress={() => {
        setTheme(mode);
        toggleColorScheme();
      }}
      className="w-full border-none shadow-none flex-row items-center justify-between py-5 px-4 rounded-xl"
    >
      <View className="flex-row items-center">
        {icon}
        <Text className="ml-2 text-lg font-urbanist-semibold text-black dark:text-white">
          {label}
        </Text>
      </View>
      {theme === mode && <Check color={isDarkMode ? "white" : "black"} />}
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
        <View className="border-t border-borderColor dark:border-borderDark w-full">
          {renderOption(
            "Dark",
            <Moon color={isDarkMode ? "white" : "black"} />,
            "dark"
          )}
        </View>
      </View>
    </View>
  );
};

export default Theme;
