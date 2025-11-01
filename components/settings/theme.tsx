import { Check, Loader, Moon, Sun } from "lucide-react-native";
import React, { JSX, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ToastAndroid,
  ImageBackground,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useTheme } from "../../context/themeContext";
import Constants from "expo-constants";
import {
  RewardedInterstitialAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";
import { useWords } from "@/context/globalContext";
const Theme = () => {
  const RewardedInterstitialId =
    Constants.expoConfig?.extra?.admobRewardedInterstitialId;
  const { theme, setTheme, colorScheme } = useTheme();
  const { isOnline } = useWords();
  const { toggleColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const adUnitId = __DEV__
    ? TestIds.REWARDED_INTERSTITIAL
    : RewardedInterstitialId;
  //const adUnitId = TestIds.REWARDED_INTERSTITIAL;
  const adRef = useRef<RewardedInterstitialAd | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadingTheme, setLoadingTheme] = useState<null | "light" | "dark">(
    null
  );
  const [pendingMode, setPendingMode] = useState<null | "light" | "dark">(null);
  useEffect(() => {
    const rewardedInterstitial = RewardedInterstitialAd.createForAdRequest(
      adUnitId,
      {
        requestNonPersonalizedAdsOnly: true,
      }
    );

    adRef.current = rewardedInterstitial;

    // Ad loaded listener
    const unsubscribeLoaded = rewardedInterstitial.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setLoaded(true);
        if (adRef.current) {
          adRef.current.show();
          setLoaded(false);
        }
        // console.log("Rewarded interstitial loaded");
      }
    );

    // User earned reward listener
    const unsubscribeEarned = rewardedInterstitial.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        // console.log("User earned reward:", reward);
        toggleColorScheme();
        setTheme(pendingMode!);
        setLoadingTheme(null);
        setPendingMode(null);
      }
    );

    // Ad closed listener → load the next ad immediately
    const unsubscribeClosed = rewardedInterstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        // console.log("Rewarded interstitial closed");
        setLoadingTheme(null);
        setPendingMode(null);
      }
    );

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
    };
  }, []);

  // Show the ad when button clicked
  const showAd = (mode: "light" | "dark") => {
    if (!isOnline) {
      toggleColorScheme();
      setTheme(mode);
      return;
    }

    if (adRef.current) {
      setLoadingTheme(mode);
      setPendingMode(mode);
      adRef.current.load(); // load only when clicked
    } else {
      ToastAndroid.show("Failed to load ad. Try again.", ToastAndroid.SHORT);
    }
  };

  const renderOption = (label: string, mode: "light" | "dark") => (
    <TouchableOpacity
      disabled={theme === mode}
      onPress={() => {
        setTheme(mode);
        if (isOnline) {
          // only try ads if online
          showAd(mode);
        } else {
          // offline: just switch instantly
          toggleColorScheme();
        }
      }}
      className={`w-[40%] h-48 border-none shadow-none items-center justify-between rounded-2xl`}
    >
      <View className="w-full h-full items-center rounded-3xl">
        <ImageBackground
          key={`${mode}-${theme}`}
          fadeDuration={0}
          source={
            mode == "light"
              ? require("../../assets/images/lightTheme.jpeg")
              : require("../../assets/images/darkTheme.jpeg")
          }
          className={`w-full h-48 rounded-3xl overflow-hidden justify-end ${theme == mode ? "border-2 border-borderDark" : "border-none"}`}
          resizeMode="cover"
        >
          <View className="flex-row py-1 justify-center w-full">
            {loadingTheme != mode ? (
              <Text
                className={`text-lg font-urbanist-semibold ${mode == "light" ? "text-black" : "text-white"}`}
              >
                {label}
              </Text>
            ) : (
              <Loader color={mode == "light" ? "black" : "white"} />
            )}
          </View>
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );
  return (
    <View className="w-full px-4 my-4 bg-white dark:bg-gray-800 rounded-3xl">
      <View className="py-4 border-b border-borderColor dark:border-borderDark">
        <Text className="text-2xl text-black dark:text-white font-urbanist-bold">
          Theme
        </Text>
      </View>
      <View className="w-full flex-row justify-around py-4">
        {renderOption("Light", "light")}
        {renderOption("Dark", "dark")}
      </View>
    </View>
  );
};

export default Theme;
