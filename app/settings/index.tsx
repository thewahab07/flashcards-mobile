import { View, Text, TouchableOpacity } from "react-native";
import { Bell, Download, SunMoon, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
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
            <Bell color="black" />
            <Text className="ml-2 text-lg font-medium text-black">
              Notifications
            </Text>
          </View>
          <ChevronRight color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border-none shadow-none flex-row items-center justify-between py-5 px-4 rounded-xl"
          onPress={() => {
            router.push("/settings/import-export");
          }}
        >
          <View className="flex-row items-center">
            <Download color="black" />
            <Text className="ml-2 text-lg font-medium text-black">
              Import/Export
            </Text>
          </View>
          <ChevronRight color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full border-none shadow-none flex-row items-center justify-between py-5 px-4 rounded-xl"
          onPress={() => {
            router.push("/settings/theme");
          }}
        >
          <View className="flex-row items-center">
            <SunMoon color="black" />
            <Text className="ml-2 text-lg font-medium text-black">Theme</Text>
          </View>
          <ChevronRight color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
