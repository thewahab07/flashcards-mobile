import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useWords } from "../context/globalContext";
import { toast } from "sonner-native";
import { Bookmark, Check, Filter, SortAsc, Trash } from "lucide-react-native";
import * as Notifications from "expo-notifications";
import { router, useLocalSearchParams } from "expo-router";
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
  const { words, setWords, displayedWords, setDisplayedWords, toggleBookmark } =
    useWords();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isSortDialog, setIsSortDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [renderType, setRenderType] = useState("dateAsc");
  const uniqueTags = Array.from(
    new Set(words.flatMap((word) => word.tags.map((tag) => tag.toLowerCase())))
  );
  const [visibleDefinitions, setVisibleDefinitions] = useState<{
    [key: number]: boolean;
  }>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams();
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
          console.log(
            "App launched from notification, scrolling to word ID:",
            wordId
          );
          scrollToWord(Number(wordId));
        }
      }

      const subscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const wordId = response.notification.request.content.data?.wordId;
          if (wordId) {
            console.log(
              "Notification tapped while app opened, scrolling to word ID:",
              wordId
            );
            scrollToWord(Number(wordId));
            console.log("Done.");
          }
        });

      return () => subscription.remove();
    };
    if (displayedWords.length > 0) {
      setupNotificationHandling();
    }
  }, [displayedWords]); // Include displayedWords as dependency
  // useEffect(() => {
  //   if (params.wordId && displayedWords.length > 0) {
  //     const wordId = Number(params.wordId);
  //     scrollToWord(wordId);
  //   }
  // }, [params.wordId, displayedWords]);
  useEffect(() => {
    const loadWords = async () => {
      const storedWords = await AsyncStorage.getItem("words");
      if (storedWords) {
        const parsedWords = JSON.parse(storedWords).map(
          (word: WordItem, index: number) => ({
            word: word.word,
            definition: word.definition,
            tags: word.tags,
            id: word.id,
            index,
          })
        );
        setWords(parsedWords);
        setDisplayedWords(parsedWords);
      }
    };
    loadWords();
  }, []);
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
      const localTime = new Date(
        now.getTime() + now.getTimezoneOffset() * 60000
      ); // Get local time
      const startOfDay = new Date(localTime.setHours(5, 0, 0, 0)); // 5r:00 AM local time
      const endOfDay = new Date(localTime.setHours(21, 0, 0, 0)); // 9:00 PM local time

      console.log("Scheduling notifications for selected words...");

      // Fixed times array: every 40 minutes between 9 AM and 9 PM
      const fixedTimes = [];
      for (let i = 0; i < 1440; i++) {
        const triggerTime = new Date(
          startOfDay.getTime() + i * 0.5 * 60 * 1000
        );
        if (triggerTime > now && triggerTime <= endOfDay) {
          fixedTimes.push(triggerTime);
        }
      }

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
            type: "date",
            date: triggerTime,
            allowWhileIdle: true,
          } as unknown as Notifications.NotificationTriggerInput,
        });
      }
    };

    setupNotifications();
  }, [words]); // Re-run when the words list changes (e.g., words are deleted)

  const scrollToWord = (wordId: number) => {
    console.log("Attempting to scroll to word ID:", wordId);
    const index = displayedWords.findIndex((w) => w.id === wordId);
    console.log(
      "Found word at index:",
      index,
      "in displayedWords of length:",
      displayedWords.length
    );

    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: index * height,
        animated: true,
      });
      setCurrentIndex(index);

      // Also update the URL params to reflect the current word
      router.setParams({ wordId: wordId.toString() });

      console.log("Scrolled to word:", displayedWords[index]?.word);
    } else {
      console.log("Word not found or scroll ref not available");
    }
  };

  useEffect(() => {
    // First, update the displayed words based on the render type
    const newDisplayedWords =
      renderType === "random"
        ? shuffleArray(words)
        : renderType === "dateAsc"
          ? words
          : renderType === "dateDes"
            ? [...words].reverse()
            : renderType === "marked"
              ? words.filter((word) => word.isMarked)
              : words;
    setDisplayedWords(newDisplayedWords);

    // Only update the URL params if we have words to display
    if (newDisplayedWords.length > 0) {
      // Just update the parameter, don't replace the whole route
      router.setParams({ wordId: newDisplayedWords[0].id.toString() });
    }
  }, [renderType, words]);

  const toggleDefinition = (index: number) => {
    setVisibleDefinitions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const deleteWord = (id: number) => {
    if (words.length === 0) {
      toast.error("There's nothing to delete! 🚫");
      setIsDeleteDialogOpen(false);
      return;
    }

    const updatedWords = words.filter((word) => word.id !== id);
    setWords(updatedWords);
    setDisplayedWords(updatedWords);
    AsyncStorage.setItem("words", JSON.stringify(updatedWords));

    toast.error("Poof! That word just vanished into the void. 🚀");
    setIsDeleteDialogOpen(false);
  };
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setDisplayedWords(words);
      return;
    }
    const searchTags = searchQuery
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag !== "");

    const filteredWords =
      searchQuery.trim() === ""
        ? words
        : words.filter((word) =>
            word.tags.some((tag) => searchTags.includes(tag.toLowerCase()))
          );

    setDisplayedWords(filteredWords);
    setSearchQuery("");
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
                      <Text className="text-5xl font-urbanist-bold text-primary">
                        {item.word}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <View className="w-full h-[15%] rounded-b-3xl border-t border-borderColor dark:border-borderDark items-center justify-around flex-row">
                    <View>
                      <Trash
                        onPress={() => {
                          setIsDeleteDialogOpen(true);
                        }}
                        size={22}
                        color="#9ca3af"
                      />
                    </View>
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

      <View className="justify-between items-center flex-row pt-1 dark:bg-backgroundDark bg-background border-b border-borderColor dark:border-borderDark absolute top-0 w-full px-6 h-20">
        <View>
          <Text className="text-3xl text-primary font-sevillana-regular">
            Flash
          </Text>
        </View>
        <View className="flex-row justify-around items-center w-1/2">
          <Text className="text-xl font-urbanist-semibold text-[#9ca3af]">
            {displayedWords.length === 0
              ? "0 / 0"
              : `${Math.min(currentIndex + 1, displayedWords.length)}/${
                  displayedWords.length
                }`}
          </Text>
          <View>
            <Filter
              onPress={() => {
                setIsSearchDialogOpen(true);
              }}
              size={22}
              color="#9ca3af"
            />
          </View>
          <View className="my-4">
            <SortAsc
              onPress={() => {
                setIsSortDialog(true);
              }}
              size={22}
              color="#9ca3af"
            />
          </View>
          {/* {seachReset && (
            <TouchableOpacity
              onPress={() => {
                setDisplayedWords(words);
                setSearchQuery("");
                setSeachReset(false);
              }}
            >
              <SearchX size={22} color={isDarkMode ? "white" : "#9ca3af"} />
            </TouchableOpacity>
          )} */}
        </View>
      </View>
      <Modal
        visible={isSearchDialogOpen}
        animationType="fade"
        transparent={true}
      >
        <View className="justify-center flex-1 bg-[rgba(0,0,0,0.5)]">
          <View className="bg-background dark:bg-backgroundDark w-[90%] self-center rounded-lg border border-borderColor dark:border-borderDark p-6">
            <View>
              <Text className="text-xl pl-1 text-black dark:text-white font-urbanist-bold">
                Filter by Tags
              </Text>
              <TextInput
                placeholder="Enter tags (comma separated)"
                placeholderTextColor="#888"
                className="my-2 pl-1 py-2 rounded-lg border-b border-borderColor dark:border-borderDark text-black dark:text-white font-urbanist-medium"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <View className="flex-row flex-wrap">
                {uniqueTags.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      setSearchQuery((prev) => (prev ? `${prev}, ${tag}` : tag))
                    }
                  >
                    <View className="text-white bg-primary mt-2 mx-1 px-3 py-[1px] pb-[2px] rounded-xl items-center justify-center">
                      <Text className="text-white dark:text-white text-sm text-center font-urbanist-medium">
                        {tag}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="flex-row justify-end pt-2">
              <TouchableOpacity
                className="px-4 mx-1 py-2 border border-borderColor dark:border-borderDark rounded-md dark:bg-backgroundDark"
                onPress={() => {
                  setIsSearchDialogOpen(false);
                  setDisplayedWords(words);
                  setSearchQuery("");
                }}
              >
                <Text className="text-black dark:text-white font-urbanist-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleSearch();
                  setIsSearchDialogOpen(false);
                }}
                className="px-4 mx-1 py-2 bg-primary rounded-md"
              >
                <Text className="text-white font-urbanist-semibold">Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={isSortDialog} animationType="fade" transparent={true}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsSortDialog(false)}
          className="justify-center flex-1 bg-[rgba(0,0,0,0.5)]"
        >
          <View className="bg-white dark:bg-backgroundDark w-full self-center rounded-lg border border-borderColor dark:border-borderDark p-4 bottom-0 absolute">
            <Text className="text-2xl pl-2 py-2 text-black dark:text-white font-urbanist-bold">
              Sort by
            </Text>
            <TouchableOpacity
              onPress={() => {
                setRenderType("dateAsc");
                setIsSortDialog(false);
              }}
              className="w-full"
            >
              <View className="flex-row justify-between items-center w-full px-2 py-4">
                <Text className="text-xl text-black dark:text-white font-urbanist-medium">
                  Date added (ascending)
                </Text>
                {renderType === "dateAsc" && (
                  <View className="items-center justify-center">
                    <Check size={22} color="#9ca3af" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setRenderType("dateDes");
                setIsSortDialog(false);
              }}
              className="w-full border-y border-borderColor dark:border-borderDark"
            >
              <View className="flex-row justify-between items-center w-full px-2 py-4">
                <Text className="text-xl text-black dark:text-white font-urbanist-medium">
                  Date added (descending)
                </Text>
                {renderType === "dateDes" && (
                  <View className="items-center justify-center">
                    <Check size={22} color="#9ca3af" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setRenderType("random");
                setIsSortDialog(false);
              }}
              className="w-full border-b border-borderColor dark:border-borderDark"
            >
              <View className="flex-row justify-between items-center w-full px-2 py-4">
                <Text className="text-xl text-black dark:text-white font-urbanist-medium">
                  Random
                </Text>
                {renderType === "random" && (
                  <View className="items-center justify-center">
                    <Check size={22} color="#9ca3af" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setRenderType("marked");
                setIsSortDialog(false);
              }}
              className="w-full"
            >
              <View className="flex-row justify-between items-center w-full px-2 py-4">
                <Text className="text-xl text-black dark:text-white font-urbanist-medium">
                  Bookmarked
                </Text>
                {renderType === "marked" && (
                  <View className="items-center justify-center">
                    <Check size={22} color="#9ca3af" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-4 mx-1 py-2 mt-2 border border-borderColor dark:border-borderDark rounded-md bg-primary justify-center items-center"
              onPress={() => setIsSortDialog(false)}
            >
              <Text className="text-white text-xl dark:text-white font-urbanist-semibold">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal
        visible={isDeleteDialogOpen}
        animationType="fade"
        transparent={true}
      >
        <View className="justify-center flex-1 bg-[rgba(0,0,0,0.5)]">
          <View className="bg-white dark:bg-backgroundDark w-[90%] self-center rounded-lg border border-borderColor dark:border-borderDark p-6">
            <Text className="text-xl font-urbanist-bold text-black dark:text-white mb-1">
              Are you sure?
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-300 mb-6 font-urbanist-medium">
              Do you really want to delete this word?
            </Text>
            <View className="flex-row justify-end">
              <TouchableOpacity
                className="px-4 mx-1 py-2 border border-borderColor dark:border-borderDark rounded-md dark:bg-backgroundDark"
                onPress={() => setIsDeleteDialogOpen(false)}
              >
                <Text className="text-black dark:text-white font-urbanist-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 mx-1 py-2 bg-red-600 rounded-md"
                onPress={() => {
                  deleteWord(displayedWords[currentIndex]?.id);
                }}
              >
                <Text className="text-white font-urbanist-semibold">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
