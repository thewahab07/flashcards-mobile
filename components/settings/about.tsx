import React from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { useTheme } from "../../context/themeContext";
import { ChevronRight, ClipboardList, Info, Star } from "lucide-react-native";

const About = () => {
  const { colorScheme } = useTheme();
  const isDarkMode = colorScheme === "dark";
  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn("Can't handle URL:", url);
      }
    } catch (err) {
      console.error("Failed to open link:", err);
    }
  };

  const handlePolicy = () => {
    openLink("https://thewahab07.github.io/flashcards-mobile/");
  };

  const handleRating = () => {
    openLink("https://play.google.com/store/apps/details?id=com.orion.flash");
  };
  return (
    <View className="w-full px-4 my-4 mb-8 bg-white dark:bg-gray-800 rounded-3xl">
      <View className="py-4 border-b border-borderColor dark:border-borderDark">
        <Text className="text-2xl text-black dark:text-white font-urbanist-bold">
          About
        </Text>
      </View>
      <View className="w-full items-center py-4">
        <TouchableOpacity
          onPress={handleRating}
          className="w-full flex-row items-center justify-between my-2 py-5 px-4 rounded-xl bg-background dark:bg-backgroundDark"
        >
          <View className="flex-row items-center">
            <Star color={isDarkMode ? "white" : "black"} />
            <View>
              <Text className="ml-2 text-lg font-urbanist-semibold text-black dark:text-white">
                Rate Flash
              </Text>
              <Text className="ml-[10px] text-sm font-urbanist-medium text-gray-500">
                Give our app a rating.
              </Text>
            </View>
          </View>
          <ChevronRight color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePolicy}
          className="w-full flex-row items-center justify-between my-2 py-5 px-4 rounded-xl bg-background dark:bg-backgroundDark"
        >
          <View className="flex-row items-center">
            <ClipboardList color={isDarkMode ? "white" : "black"} />
            <View>
              <Text className="ml-2 text-lg font-urbanist-semibold text-black dark:text-white">
                Terms & Privacy Policy
              </Text>
              <Text className="ml-[10px] text-sm font-urbanist-medium text-gray-500">
                Read our privacy policy.
              </Text>
            </View>
          </View>
          <ChevronRight color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
        <View className="w-full flex-row items-center my-2 py-5 px-4 rounded-xl bg-background dark:bg-backgroundDark">
          <Info color={isDarkMode ? "white" : "black"} />
          <View>
            <Text className="ml-2 text-lg font-urbanist-semibold text-black dark:text-white">
              App Version
            </Text>
            <Text className="ml-[10px] text-sm font-urbanist-medium text-gray-500">
              1.2.3
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default About;
