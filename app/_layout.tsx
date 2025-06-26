import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "./global.css";
import "nativewind";
import { WordsProvider } from "./context/globalContext";
import { Toaster } from "sonner-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomMenu from "@/components/BottomMenu";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./context/themeContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useTheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <WordsProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <SafeAreaView className="flex-1">
            <Stack screenOptions={{ headerShown: false }} />
          </SafeAreaView>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <BottomMenu />
          <Toaster position="bottom-center" richColors />
        </ThemeProvider>
      </GestureHandlerRootView>
    </WordsProvider>
  );
}
