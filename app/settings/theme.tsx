import { Check, Loader, Moon, Sun } from "lucide-react-native";
import React, { JSX, useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ToastAndroid } from "react-native";
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

  const renderOption = (
    label: string,
    icon: JSX.Element,
    mode: "light" | "dark"
  ) => (
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
      className="w-full border-none shadow-none flex-row items-center justify-between py-5 px-4 rounded-xl"
    >
      <View className="flex-row items-center">
        {icon}
        <Text className="ml-2 text-lg font-urbanist-semibold text-black dark:text-white">
          {label}
        </Text>
      </View>
      {loadingTheme === mode ? (
        <Loader color={isDarkMode ? "white" : "black"} />
      ) : theme === mode ? (
        <Check color={isDarkMode ? "white" : "black"} />
      ) : null}
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
