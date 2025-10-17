import React, { useEffect, useRef, useState } from "react";
import { View, Text, Dimensions, FlatList } from "react-native";
import { useFonts } from "expo-font";
import { useWords } from "../../context/globalContext";
import * as Notifications from "expo-notifications";
import { router, SplashScreen } from "expo-router";
import TopBar from "@/components/TopBar";
import WordCard from "@/components/WordCard";
import { WordItem } from "@/types";
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";
import Constants from "expo-constants";
import NetInfo from "@react-native-community/netinfo";
import { createClient } from "@supabase/supabase-js";

const { height } = Dimensions.get("window");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
export default function Home() {
  const [fontsLoaded] = useFonts({
    Urbanist_400Regular: require("../../assets/fonts/Urbanist-Regular.ttf"),
    Urbanist_700Bold: require("../../assets/fonts/Urbanist-Bold.ttf"),
    Urbanist_100Thin: require("../../assets/fonts/Urbanist-Thin.ttf"),
    Urbanist_200ExtraLight: require("../../assets/fonts/Urbanist-ExtraLight.ttf"),
    Urbanist_300Light: require("../../assets/fonts/Urbanist-Light.ttf"),
    Urbanist_500Medium: require("../../assets/fonts/Urbanist-Medium.ttf"),
    Urbanist_600SemiBold: require("../../assets/fonts/Urbanist-SemiBold.ttf"),
    Urbanist_800ExtraBold: require("../../assets/fonts/Urbanist-ExtraBold.ttf"),
    Urbanist_900Black: require("../../assets/fonts/Urbanist-Black.ttf"),
    Sevillana_400Regular: require("../../assets/fonts/Sevillana-Regular.ttf"),
  });
  const { words, displayedWords, startTime, endTime, interval, setIsOnline } =
    useWords();
  const [currentIndex, setCurrentIndex] = useState(0);
  const previousIndexRef = useRef(0);
  const shownAdIndexes = useRef<Set<number>>(new Set());
  const [visibleDefinitions, setVisibleDefinitions] = useState<{
    [key: number]: boolean;
  }>({});
  const scrollViewRef = useRef<FlatList>(null);
  const didScroll = useRef(false);
  const interstitialId = Constants.expoConfig?.extra?.admobInterstitialId;
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
  // const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : interstitialId;
  const adUnitId = TestIds.INTERSTITIAL;
  const ad = useRef(InterstitialAd.createForAdRequest(adUnitId)).current;
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Check connection on launch
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });

    // Optional: Listen for future changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const setupNotificationHandling = () => {
      const lastNotificationResponse =
        Notifications.getLastNotificationResponse();
      if (lastNotificationResponse) {
        const wordId =
          lastNotificationResponse.notification.request.content.data?.wordId;
        if (wordId && displayedWords.length > 0 && !didScroll.current) {
          // console.log(
          //   "App launched from notification, scrolling to word ID:",
          //   wordId
          // );
          setTimeout(() => {
            scrollToWord(Number(wordId));
          }, 500);
          didScroll.current = true;
        }
      }

      const subscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const wordId = response.notification.request.content.data?.wordId;
          if (wordId) {
            // console.log(
            //   "Notification tapped while app opened, scrolling to word ID:",
            //   wordId
            // );
            scrollToWord(Number(wordId));
            // console.log("Done.");
          }
        });

      return () => subscription.remove();
    };
    if (displayedWords.length > 0) {
      setupNotificationHandling();
    }
  }, [displayedWords]); // Include displayedWords as dependency

  let supabase: ReturnType<typeof createClient> | null = null;
  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (err) {
      //console.error("Failed to create Supabase client:", err);
      supabase = null;
    }
  } else {
    //console.warn(
    // "Supabase config missing! supabaseUrl or supabaseAnonKey is undefined in Constants.expoConfig.extra"
    //);
  }
  async function registerForPushNotificationsAsync() {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        //console.info("Push notification permission not granted");
        return null;
      }

      // only pass projectId if available
      const opts = Constants.expoConfig?.extra?.eas?.projectId
        ? { projectId: Constants.expoConfig?.extra?.eas?.projectId }
        : undefined;

      const tokenResp = await Notifications.getExpoPushTokenAsync(opts as any);
      const token = tokenResp?.data;
      if (!token) {
        //console.warn("No push token returned", tokenResp);
        return null;
      }
      return token;
    } catch (err) {
      //console.error("Error registering for push notifications:", err);
      return null;
    }
  }

  useEffect(() => {
    const saveToken = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (!token) return;

        if (!supabase) {
          //console.warn("Skipping saving token: Supabase client unavailable.");
          return;
        }

        const { data, error } = await (supabase as any)
          .from("device_tokens")
          .upsert({ token }, { onConflict: "token" });

        if (error) {
          //console.error("Error saving token to Supabase:", error);
        } else {
          //console.info("Token saved to Supabase ✅", data);
        }
      } catch (err) {
        //console.error("Unexpected error in saveToken:", err);
      }
    };

    saveToken();
  }, []);

  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;

      await Notifications.cancelAllScheduledNotificationsAsync();

      if (!words.length) return;

      const shuffled = shuffleArray(words);
      const now = new Date();
      const fixedTimes: Date[] = [];
      const intervalMs = interval * 60 * 1000;

      for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
        const start = new Date();
        start.setDate(start.getDate() + dayOffset);
        start.setHours(startTime, 0, 0, 0);

        const end = new Date();
        end.setDate(end.getDate() + dayOffset);
        end.setHours(endTime, 0, 0, 0);

        for (let t = start.getTime(); t <= end.getTime(); t += intervalMs) {
          const triggerTime = new Date(t);
          if (triggerTime > now) {
            fixedTimes.push(triggerTime);
          }
        }
      }

      // console.log("Fixed times to schedule:", fixedTimes.length);

      await Promise.all(
        fixedTimes.map((triggerTime, i) =>
          Notifications.scheduleNotificationAsync({
            content: {
              title: "Flash Word",
              body: `Do you remember ${shuffled[i % shuffled.length].word}?`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.MAX,
              data: {
                wordId: shuffled[i % shuffled.length].id,
                url: `myapp://word/${shuffled[i % shuffled.length].id}`,
              },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: triggerTime,
            },
          })
        )
      );
    };

    setupNotifications();
  }, [words, startTime, endTime, interval]);

  useEffect(() => {
    const unsubscribe = ad.addAdEventListener(AdEventType.LOADED, () => {
      setAdLoaded(true);
    });

    const unsubscribeClose = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setAdLoaded(false);
      ad.load(); // Preload next ad
    });

    ad.load(); // Initial load

    return () => {
      unsubscribe();
      unsubscribeClose();
    };
  }, []);

  const scrollToWord = (wordId: number) => {
    //console.log("Attempting to scroll to word ID:", wordId);
    const index = displayedWords.findIndex((w) => w.id === wordId);
    //console.log(
    //  "Found word at index:",
    //  index,
    // "in displayedWords of length:",
    //  displayedWords.length
    // );

    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current?.scrollToOffset({
        offset: index * height,
        animated: true,
      });
      setCurrentIndex(index);

      // Also update the URL params to reflect the current word
      router.setParams({ wordId: wordId.toString() });

      //console.log("Scrolled to word:", displayedWords[index]?.word);
    } else {
      //console.log("Word not found or scroll ref not available");
    }
  };

  const toggleDefinition = (index: number) => {
    setVisibleDefinitions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const shuffleArray = (arr: Array<WordItem>) => {
    return [...arr].sort(() => Math.random() - 0.5);
  };
  useEffect(() => {
    if (fontsLoaded) {
      // once fonts are ready, hide splash
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    // don’t render anything until fonts are ready
    return null;
  }
  return (
    <View className="w-full h-screen">
      {words.length == 0 ? (
        <View className="h-full w-full p-4 flex justify-center items-center">
          <Text className="text-2xl text-gray-500 font-urbanist-medium mb-16">
            The void is empty... for now. Add some words to bring it to life! ✨
          </Text>
        </View>
      ) : displayedWords.length == 0 ? (
        <View className="h-full w-full p-4 flex justify-center items-center mb-16">
          <Text className="text-2xl text-gray-500 font-urbanist-medium">
            Zero words. Try a different vibe. 🤷‍♂️
          </Text>
        </View>
      ) : (
        <FlatList
          initialNumToRender={2}
          maxToRenderPerBatch={4}
          windowSize={2}
          removeClippedSubviews={true}
          data={displayedWords}
          ref={scrollViewRef}
          keyExtractor={(_, index) => index.toString()}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 0 }}
          className="w-full h-full"
          decelerationRate="normal"
          scrollEventThrottle={16}
          onMomentumScrollEnd={(event) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            const index = Math.round(offsetY / height);

            const isForward = index > previousIndexRef.current;
            const isMilestone = index !== 0 && index % 15 === 0;
            const hasSeenAd = shownAdIndexes.current.has(index);

            if (isForward && isMilestone && !hasSeenAd && adLoaded) {
              ad.show();
              shownAdIndexes.current.add(index);
            }

            previousIndexRef.current = index;
            setCurrentIndex(index);
          }}
          getItemLayout={(_, index) => ({
            length: height, // height of each item
            offset: height * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <WordCard
              key={index}
              item={item}
              id={index}
              height={height}
              currentIndex={currentIndex}
              toggleDefinition={toggleDefinition}
              visibleDefinitions={visibleDefinitions}
            />
          )}
        />
      )}
      <TopBar currentIndex={currentIndex} scrollToWord={scrollToWord} />
    </View>
  );
}
