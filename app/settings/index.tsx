import { View, Text, TouchableOpacity } from "react-native";
import { Bell, Download, SunMoon, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/themeContext";

export default function SettingsScreen() {
  const { colorScheme } = useTheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();
  return (
    <View className="w-full h-full px-6">
      <View className="w-full items-center space-y-2">
        <TouchableOpacity
          className="w-full border-none shadow-none flex-row items-center justify-between py-5 px-4 rounded-xl"
          onPress={() => {
            router.push("/settings/notifications");
          }}
        >
          <View className="flex-row items-center">
            <Bell color={isDarkMode ? "white" : "black"} />
            <Text className="ml-2 text-lg font-urbanist-semibold text-black dark:text-white">
              Notifications
            </Text>
          </View>
          <ChevronRight color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border-y border-borderColor dark:border-borderDark shadow-none flex-row items-center justify-between py-5 px-4 rounded-xl"
          onPress={() => {
            router.push("/settings/import-export");
          }}
        >
          <View className="flex-row items-center">
            <Download color={isDarkMode ? "white" : "black"} />
            <Text className="ml-2 text-lg font-urbanist-semibold text-black dark:text-white">
              Import/Export
            </Text>
          </View>
          <ChevronRight color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border-none shadow-none flex-row items-center justify-between py-5 px-4 rounded-xl"
          onPress={() => {
            router.push("/settings/theme");
          }}
        >
          <View className="flex-row items-center">
            <SunMoon color={isDarkMode ? "white" : "black"} />
            <Text className="ml-2 text-lg font-urbanist-semibold text-black dark:text-white">
              Theme
            </Text>
          </View>
          <ChevronRight color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
