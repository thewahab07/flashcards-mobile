import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "./global.css";
import "nativewind";
import { WordsProvider } from "../context/globalContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomMenu from "@/components/BottomMenu";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "../context/themeContext";
import BannerAdComp from "@/components/BannerAdComp";
import mobileAds from "react-native-google-mobile-ads";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function LayoutContent() {
  const { colorScheme } = useTheme();
  const [adsReady, setAdsReady] = useState(false);

  useEffect(() => {
    mobileAds()
      .initialize()
      .then((adapterStatuses) => {
        //console.warn("AdMob initialized");
        setAdsReady(true);
      })
      .catch((err) => {
        //console.error("Did not initialize.", err);
      });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        {adsReady ? <BannerAdComp /> : null}
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>

      <StatusBar
        style={colorScheme === "dark" ? "light" : "dark"}
        backgroundColor={colorScheme === "dark" ? "#111827" : "#f8fafc"}
        translucent={false}
      />

      <BottomMenu />
    </GestureHandlerRootView>
  );
}
export default function RootLayout() {
  return (
    <WordsProvider>
      <ThemeProvider>
        <LayoutContent />
      </ThemeProvider>
    </WordsProvider>
  );
}
