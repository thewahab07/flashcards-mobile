import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useFonts } from "@expo-google-fonts/urbanist";
import { Sevillana_400Regular } from "@expo-google-fonts/sevillana";
import {
  Urbanist_400Regular,
  Urbanist_700Bold,
  Urbanist_100Thin,
  Urbanist_200ExtraLight,
  Urbanist_300Light,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_800ExtraBold,
  Urbanist_900Black,
} from "@expo-google-fonts/urbanist";
import { useWords } from "../context/globalContext";
import { Bookmark } from "lucide-react-native";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import DeleteButton from "@/components/DeleteButton";
import TopBar from "@/components/TopBar";
interface WordItem {
  word: string;
  definition: string;
  tags: Array<string>;
  id: number;
  isMarked: boolean;
}
const { height } = Dimensions.get("window");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
export default function Home() {
  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_700Bold,
    Urbanist_100Thin,
    Urbanist_200ExtraLight,
    Urbanist_300Light,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_800ExtraBold,
    Urbanist_900Black,
    Sevillana_400Regular,
  });
  const {
    words,
    displayedWords,
    toggleBookmark,
    startTime,
    endTime,
    interval,
  } = useWords();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleDefinitions, setVisibleDefinitions] = useState<{
    [key: number]: boolean;
  }>({});
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const tempId = displayedWords[0]?.id;
    scrollToWord(tempId);

    const setupNotificationHandling = async () => {
      const lastNotificationResponse =
        await Notifications.getLastNotificationResponseAsync();
      if (lastNotificationResponse) {
        const wordId =
          lastNotificationResponse.notification.request.content.data?.wordId;
        if (wordId && displayedWords.length > 0) {
          // console.log(
          //   "App launched from notification, scrolling to word ID:",
          //   wordId
          // );
          scrollToWord(Number(wordId));
        }
      }

      const subscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const wordId = response.notification.request.content.data?.wordId;
          if (wordId) {
            //console.log(
            //  "Notification tapped while app opened, scrolling to word ID:",
            // wordId
            //);
            scrollToWord(Number(wordId));
            //console.log("Done.");
          }
        });

      return () => subscription.remove();
    };
    if (displayedWords.length > 0) {
      setupNotificationHandling();
    }
  }, [displayedWords]); // Include displayedWords as dependency
  // useEffect(() => {
  //   const loadWords = async () => {
  //     const storedWords = await AsyncStorage.getItem("words");
  //     if (storedWords) {
  //       const parsedWords = JSON.parse(storedWords).map(
  //         (word: WordItem, index: number) => ({
  //           word: word.word,
  //           definition: word.definition,
  //           tags: word.tags,
  //           id: word.id,
  //           index,
  //         })
  //       );
  //       setWords(parsedWords);
  //       setDisplayedWords(parsedWords);
  //     }
  //   };
  //   loadWords();
  // }, []);
  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync(); // Prevent duplicates
      if (words.length === 0) return;

      const shuffled = shuffleArray(words); // Shuffle the words for randomness
      const now = new Date();
      const start = new Date();
      start.setHours(startTime, 0, 0, 0);

      const end = new Date();
      end.setHours(endTime, 0, 0, 0);

      const fixedTimes = [];
      const intervalMs = interval * 60 * 1000; // first number is minutes

      for (let t = start.getTime(); t <= end.getTime(); t += intervalMs) {
        const triggerTime = new Date(t);
        if (triggerTime > now) {
          fixedTimes.push(triggerTime);
        }
      }
      //console.log("Fixed times to schedule:", fixedTimes.length);

      // Loop through the fixed times and schedule notifications
      for (let i = 0; i < fixedTimes.length; i++) {
        const triggerTime = fixedTimes[i];
        //console.log(triggerTime);

        // Ensure we have a word to schedule
        const wordIndex = i % shuffled.length; // Get word based on fixed time
        const word = shuffled[wordIndex];

        // If there is no word, continue to the next fixed time
        if (!word) continue;

        //console.log(word.word); // Logging the word to be sent in the notification

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Flash Word",
            body: `Do you remember ${word.word}?`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            data: {
              wordId: word.id, // include the ID
              url: `myapp://word/${word.id}`,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerTime,
          },
        });
      }
    };

    setupNotifications();
  }, [words, startTime, endTime, interval]);

  const scrollToWord = (wordId: number) => {
    //console.log("Attempting to scroll to word ID:", wordId);
    const index = displayedWords.findIndex((w) => w.id === wordId);
    //console.log(
    //  "Found word at index:",
    //  index,
    //  "in displayedWords of length:",
    //  displayedWords.length
    //);

    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: index * height,
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
  return (
    <View className="w-full h-screen">
      {words.length == 0 ? (
        <View className="h-full w-full p-4 flex justify-center items-center">
          <Text className="text-2xl text-gray-500 font-urbanist-medium">
            The void is empty... for now. Add some words to bring it to life! ✨
          </Text>
        </View>
      ) : displayedWords.length == 0 ? (
        <View className="h-full w-full p-4 flex justify-center items-center">
          <Text className="text-2xl text-gray-500 font-urbanist-medium">
            Zero words. Try a different vibe. 🤷‍♂️
          </Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 0 }}
          className="w-full h-full"
          decelerationRate="fast" // <-- This makes the scroll snap faster
          scrollEventThrottle={16} // <-- Ensures smooth scrolling updates
          onMomentumScrollEnd={(event) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            const index = Math.round(offsetY / height); // height is already defined from Dimensions
            setCurrentIndex(index);
          }}
        >
          {displayedWords.map((item, id) => (
            <View
              key={id}
              style={{ height: height }}
              className="items-center justify-center px-4"
            >
              <View className="w-[85%] h-[60%] items-center justify-center">
                <View
                  className="w-full h-full rounded-3xl bg-white dark:bg-[#1f2937]"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 10, // Android shadow
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={1}
                    className="w-full h-[85%] items-center justify-center rounded-3xl overflow-hidden"
                    onPress={() => {
                      toggleDefinition(id);
                    }}
                  >
                    {visibleDefinitions[id] ? (
                      <View className="items-center justify-center w-full">
                        <Text className="text-3xl font-urbanist-regular text-gray-500 px-4">
                          {item.definition}
                        </Text>
                        <View className="flex-row justify-center items-center">
                          {item.tags.map((tags, num) => (
                            <View
                              className="text-white bg-primary my-2 mx-1 px-3 py-[1px] pb-[2px] rounded-xl items-center justify-center"
                              key={num}
                            >
                              <Text className="text-white dark:text-white text-sm text-center font-urbanist-medium">
                                {tags}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : (
                      <Text className="text-5xl font-urbanist-bold text-primary leading-normal ">
                        {item.word}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <View className="w-full h-[15%] rounded-b-3xl border-t border-borderColor dark:border-borderDark items-center justify-around flex-row">
                    <DeleteButton currentIndex={currentIndex} />
                    <View>
                      <Text className="text-primary font-urbanist-regular">
                        Tap to reveal 👆
                      </Text>
                    </View>
                    <View>
                      <Bookmark
                        onPress={() => toggleBookmark(item.id)}
                        size={22}
                        color="#9ca3af"
                        fill={item.isMarked ? "#9ca3af" : "none"}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      <TopBar currentIndex={currentIndex} />
    </View>
  );
}
