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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useWords } from "../context/globalContext";
import { toast } from "sonner-native";
import { Check, Filter, SearchX, SortAsc, Trash } from "lucide-react-native";
import * as Notifications from "expo-notifications";
import {
  usePathname,
  useSegments,
  router,
  useLocalSearchParams,
} from "expo-router";
import * as Linking from "expo-linking";
interface WordItem {
  word: string;
  definition: string;
  tags: Array<string>;
  id: number;
}
const { height } = Dimensions.get("window");
Linking.addEventListener("url", async (event) => {
  if (event.url.startsWith("myapp://word/")) {
    const wordId = event.url.split("/").pop();
    if (wordId) {
      await AsyncStorage.setItem("notificationWordId", wordId);
      // The navigation will happen in your component using this stored value
    }
  }
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});
Notifications.addNotificationResponseReceivedListener(async (response) => {
  const url = response.notification.request.content.data?.url;
  if (url) {
    await Linking.openURL(url);
  }
});
export default function Home() {
  const {
    words,
    setWords,
    displayedWords,
    setDisplayedWords,
    notificationPermission,
    setNotificationPermission,
    isDarkMode,
    wordsChange,
    setWordsChange,
  } = useWords();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isSortDialog, setIsSortDialog] = useState(false);
  const [seachReset, setSeachReset] = useState(false);
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
    if (params.wordId && displayedWords.length > 0) {
      const wordId = Number(params.wordId);
      scrollToWord(wordId);
    }
  }, [params.wordId, displayedWords]);

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
        setNotificationPermission(false);
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync(); // Prevent duplicates
      setNotificationPermission(true);
      if (words.length === 0 && notificationPermission == false) return;

      const shuffled = shuffleArray(words); // Shuffle the words for randomness
      const now = new Date();
      const localTime = new Date(
        now.getTime() + now.getTimezoneOffset() * 60000
      ); // Get local time
      const startOfDay = new Date(localTime.setHours(9, 0, 0, 0)); // 9:00 AM local time
      const endOfDay = new Date(localTime.setHours(21, 0, 0, 0)); // 9:00 PM local time

      //console.log("Scheduling notifications for selected words...");

      // Fixed times array: every 40 minutes between 9 AM and 9 PM
      const fixedTimes = [];
      for (let i = 0; i < 18; i++) {
        const triggerTime = new Date(startOfDay.getTime() + i * 40 * 60 * 1000);
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
            priority: Notifications.AndroidNotificationPriority.HIGH,
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
  }, [wordsChange]); // Re-run when the words list changes (e.g., words are deleted)

  const scrollToWord = (wordId: number) => {
    const index = displayedWords.findIndex((w) => w.id === wordId);
    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: index * height,
        animated: true,
      });
      setCurrentIndex(index);
    }
  };
  useEffect(() => {
    const getNotificationID = async () => {
      try {
        const wordId = await AsyncStorage.getItem("notificationWordId");
        if (wordId) {
          // Clear it after getting it to prevent repeated processing
          await AsyncStorage.removeItem("notificationWordId");
          scrollToWord(Number(wordId));
          //console.log("Word ID from storage:", wordId);
        }
      } catch (error) {
        console.error("Error retrieving notification word ID:", error);
      }
    };

    getNotificationID();

    // Setup URL handling for this component
    const subscription = Linking.addEventListener("url", (event) => {
      if (event.url.startsWith("myapp://word/")) {
        const wordId = event.url.split("/").pop();
        if (wordId) {
          scrollToWord(Number(wordId));
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

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
    setWordsChange(!wordsChange);

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
  useEffect(() => {
    setDisplayedWords(
      renderType === "random"
        ? shuffleArray(words)
        : renderType === "dateAsc"
        ? words
        : renderType === "dateDes"
        ? [...words].reverse()
        : words
    );
  }, [renderType, words, setDisplayedWords]);
  return (
    <View className="w-full h-screen">
      {words.length == 0 ? (
        <View className="h-full w-full p-4 flex justify-center items-center">
          <Text className="text-2xl text-gray-500">
            The void is empty... for now. Add some words to bring it to life! ✨
          </Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 0 }}
          className="w-full h-full"
          // Modify your onMomentumScrollEnd handler in the ScrollView
          onMomentumScrollEnd={(event) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            const index = Math.round(offsetY / height);
            setCurrentIndex(index);

            // Get the current word ID
            const currentWordId = displayedWords[index]?.id;
            if (currentWordId !== undefined) {
              // Update the URL without actual navigation
              router.setParams({ wordId: currentWordId.toString() });
            }
          }}
        >
          {displayedWords.map((item, id) => (
            <View
              key={id}
              style={{ height: height }}
              className="items-center justify-center px-4"
            >
              <View className="border-2 rounded-lg border-[#b1b1b1] h-[70%] w-[80%] items-center justify-center">
                <TouchableOpacity
                  activeOpacity={1}
                  className="w-full h-full items-center justify-center"
                  onPress={() => {
                    toggleDefinition(id);
                  }}
                >
                  {visibleDefinitions[id] ? (
                    <View className="items-center justify-center w-full">
                      <Text className="text-3xl text-gray-500">
                        {item.definition}
                      </Text>
                      <View className="flex-row justify-center items-center">
                        {item.tags.map((tags, num) => (
                          <Text
                            key={num}
                            className="border border-borderColor text-black dark:text-white my-2 mx-1 px-2 py-1 rounded-xl"
                          >
                            {tags}
                          </Text>
                        ))}
                      </View>
                    </View>
                  ) : (
                    <Text className="text-5xl font-bold text-black dark:text-white">
                      {item.word}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      <View className="h-full w-[14%] absolute right-0  py-36 items-center justify-between">
        <View>
          <View>
            <Filter
              onPress={() => {
                setIsSearchDialogOpen(true);
              }}
              size={32}
              color={isDarkMode ? "white" : "black"}
            />
          </View>
          <View className="my-4">
            <SortAsc
              onPress={() => {
                setIsSortDialog(true);
              }}
              size={32}
              color={isDarkMode ? "white" : "black"}
            />
          </View>
          {seachReset && (
            <TouchableOpacity
              onPress={() => {
                setDisplayedWords(words);
                setSearchQuery("");
                setSeachReset(false);
              }}
            >
              <SearchX size={32} color={isDarkMode ? "white" : "black"} />
            </TouchableOpacity>
          )}
        </View>
        <View>
          <Text className="text-xl font-semibold text-black dark:text-white">
            {displayedWords.length === 0
              ? "0 / 0"
              : `${Math.min(currentIndex + 1, displayedWords.length)} / ${
                  displayedWords.length
                }`}
          </Text>
          <View className="mt-4">
            <Trash
              onPress={() => {
                setIsDeleteDialogOpen(true);
              }}
              size={32}
              color={isDarkMode ? "white" : "black"}
            />
          </View>
        </View>
      </View>
      <View className="justify-center pt-1 dark:bg-backgroundDark bg-background border-b border-borderColor absolute top-0 w-full px-6 h-20">
        <Text className="text-3xl font-bold text-black dark:text-white">
          Flash
        </Text>
      </View>
      <Modal
        visible={isSearchDialogOpen}
        animationType="fade"
        transparent={true}
      >
        <View className="justify-center flex-1 bg-[rgba(0,0,0,0.5)]">
          <View className="bg-background dark:bg-backgroundDark w-[90%] self-center rounded-lg border border-borderColor p-6">
            <View>
              <Text className="text-xl pl-1 font-bold text-black dark:text-white ">
                Filter by Tags
              </Text>
              <TextInput
                placeholder="Enter word"
                placeholderTextColor="#888"
                className="my-2 rounded-lg border-b border-borderColor text-black dark:text-white"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <View className="flex-row">
                {uniqueTags.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      setSearchQuery((prev) => (prev ? `${prev}, ${tag}` : tag))
                    }
                  >
                    <Text className="border border-borderColor my-2 mx-1 px-2 py-1 rounded-xl text-black dark:text-white">
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="flex-row justify-end pt-2">
              <TouchableOpacity
                className="px-4 mx-1 py-2 border border-borderColor rounded-md dark:bg-backgroundDark"
                onPress={() => {
                  setIsSearchDialogOpen(false);
                  setSearchQuery("");
                }}
              >
                <Text className="text-black dark:text-white font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleSearch();
                  setIsSearchDialogOpen(false);
                  setSeachReset(true);
                }}
                className="px-4 mx-1 py-2 bg-backgroundDark dark:bg-background rounded-md"
              >
                <Text className="text-white dark:text-black font-medium">
                  Apply
                </Text>
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
          <View className="bg-white dark:bg-backgroundDark w-[90%] self-center rounded-lg border border-borderColor p-4">
            <TouchableOpacity
              onPress={() => {
                setRenderType("dateAsc");
                setIsSortDialog(false);
              }}
              className="w-full"
            >
              <View className="flex-row justify-between items-center w-full p-2">
                <Text className="text-xl text-black dark:text-white">
                  Date added (ascending)
                </Text>
                {renderType === "dateAsc" && (
                  <View className="items-center justify-center">
                    <Check size={28} color={isDarkMode ? "white" : "black"} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setRenderType("dateDes");
                setIsSortDialog(false);
              }}
              className="w-full border-y border-borderColor"
            >
              <View className="flex-row justify-between items-center w-full p-2">
                <Text className="text-xl text-black dark:text-white">
                  Date added (descending)
                </Text>
                {renderType === "dateDes" && (
                  <View className="items-center justify-center">
                    <Check size={28} color={isDarkMode ? "white" : "black"} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setRenderType("random");
                setIsSortDialog(false);
              }}
              className="w-full"
            >
              <View className="flex-row justify-between items-center w-full p-2">
                <Text className="text-xl text-black dark:text-white">
                  Random
                </Text>
                {renderType === "random" && (
                  <View className="items-center justify-center">
                    <Check size={28} color={isDarkMode ? "white" : "black"} />
                  </View>
                )}
              </View>
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
          <View className="bg-white dark:bg-backgroundDark w-[90%] self-center rounded-lg border border-borderColor p-6">
            <Text className="text-xl font-bold text-black dark:text-white mb-1">
              Are you sure?
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-300 mb-6">
              Do you really want to delete this word?
            </Text>
            <View className="flex-row justify-end">
              <TouchableOpacity
                className="px-4 mx-1 py-2 border border-borderColor rounded-md dark:bg-backgroundDark"
                onPress={() => setIsDeleteDialogOpen(false)}
              >
                <Text className="text-black dark:text-white font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 mx-1 py-2 bg-red-600 rounded-md"
                onPress={() => {
                  deleteWord(displayedWords[currentIndex]?.id);
                }}
              >
                <Text className="text-white font-medium">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
