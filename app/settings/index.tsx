import { View } from "react-native";
import Notifications from "@/components/settings/notifications";
import { ScrollView } from "react-native-gesture-handler";
import Theme from "@/components/settings/theme";
import ImportExport from "@/components/settings/import-export";
import About from "@/components/settings/about";

export default function SettingsScreen() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="w-full h-full px-6"
    >
      <View className="w-full items-center my-4">
        <Notifications />
        <Theme />
        <ImportExport />
        <About />
      </View>
    </ScrollView>
  );
}
