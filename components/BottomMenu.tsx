import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Modal, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useWords } from "@/context/globalContext";
import { HomeIcon, Plus, Settings } from "lucide-react-native";
import { useTheme } from "@/context/themeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toast } from "sonner-native";
import {
  InterstitialAd,
  AdEventType,
  //  TestIds,
} from "react-native-google-mobile-ads";

export default function BottomMenu() {
  const { colorScheme } = useTheme();
  const isDarkMode = colorScheme === "dark";
  const { activeWho, words, setWords, setDisplayedWords } = useWords();
  const [newWord, setNewWord] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [tagValue, setTagValue] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [wordAddCount, setWordAddCount] = useState(0);
  const adRef = useRef(
    InterstitialAd.createForAdRequest("ca-app-pub-1338273735434402/9515651457") // ca-app-pub-1338273735434402/9515651457 or TestIds.INTERSTITIAL
  ).current;
  const [adLoaded, setAdLoaded] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const loadListener = adRef.addAdEventListener(AdEventType.LOADED, () => {
      setAdLoaded(true);
    });

    const closeListener = adRef.addAdEventListener(AdEventType.CLOSED, () => {
      setAdLoaded(false);
      adRef.load(); // preload next
    });

    adRef.load();

    return () => {
      loadListener();
      closeListener();
    };
  }, []);

  const addWord = (
    newWord: string,
    newDefinition: string,
    newTags: string[]
  ) => {
    if (newWord && newDefinition) {
      const updatedWords = [
        ...words,
        {
          word: newWord,
          definition: newDefinition,
          tags: newTags || [],
          id: Math.random(),
          isMarked: false,
        },
      ];
      setWords(updatedWords);
      setDisplayedWords(updatedWords);
      AsyncStorage.setItem("words", JSON.stringify(updatedWords));

      toast.success("Another word enters the Hall of Knowledge! 🏛️");
      setWordAddCount((prev) => {
        const newCount = prev + 1;
        if (newCount % 5 === 0 && adLoaded) {
          adRef.show();
        }
        return newCount;
      });
    }
  };
  const handleAddWord = () => {
    const newTags = tagValue
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    addWord(newWord, newDefinition, newTags);

    setNewWord("");
    setNewDefinition("");
    setTagValue("");
    setIsModalVisible(false);
  };
  return (
    <View className="flex-row justify-between dark:bg-backgroundDark dark:text-white bg-background text-black border-t border-borderColor dark:border-borderDark absolute bottom-0 w-full py-2">
      <View className="justify-center items-center ml-4">
        <TouchableOpacity
          onPress={() => {
            router.push("/");
          }}
          className="px-2 py-3 justify-center items-center flex-row"
        >
          <HomeIcon
            size={28}
            color={activeWho === 0 ? "#7c4dff" : isDarkMode ? "white" : "black"}
          />
          {activeWho === 0 ? (
            <Text className="text-lg text-primary ml-1 font-urbanist-bold">
              Home
            </Text>
          ) : (
            <Text></Text>
          )}
        </TouchableOpacity>
      </View>
      <View className="absolute w-full m-0 left-0">
        <View className="justify-center items-center rounded-full -mt-8">
          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            className="justify-center items-center p-4 rounded-full bg-primary"
          >
            <Plus size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <View className="justify-center items-center mr-4">
        <TouchableOpacity
          onPress={() => {
            router.push("./settings");
          }}
          className="px-2 py-3 justify-center items-center flex-row"
        >
          <Settings
            size={28}
            color={activeWho === 1 ? "#7c4dff" : isDarkMode ? "white" : "black"}
          />
          {activeWho === 1 ? (
            <Text className="text-xl text-primary ml-1 font-urbanist-bold">
              Settings
            </Text>
          ) : (
            <Text></Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View className="justify-center flex-1 bg-[rgba(0,0,0,0.5)]">
          <View className="p-5 mx-5 rounded-xl bg-background dark:bg-backgroundDark">
            <TextInput
              placeholder="Enter word"
              placeholderTextColor="#888"
              className="p-[10px] rounded-lg mb-3 border-b border-borderColor dark:border-borderDark focus:border-primary text-black dark:text-white font-urbanist-medium"
              value={newWord}
              onChangeText={setNewWord}
            />
            <TextInput
              placeholder="Enter definition"
              placeholderTextColor="#888"
              style={{ textAlignVertical: "top" }}
              className="p-[10px] rounded-lg mb-3 border-b border-borderColor dark:border-borderDark focus:border-primary h-24 text-black dark:text-white font-urbanist-medium"
              multiline
              value={newDefinition}
              onChangeText={setNewDefinition}
            />
            <TextInput
              placeholder="Enter tags (comma separated)"
              placeholderTextColor="#888"
              className="p-[10px] rounded-lg mb-3 border-b border-borderColor dark:border-borderDark focus:border-primary text-black dark:text-white font-urbanist-medium"
              value={tagValue}
              onChangeText={setTagValue}
            />

            <TouchableOpacity
              className="bg-primary p-3 rounded-lg items-center mb-2"
              onPress={handleAddWord}
            >
              <Text className="text-white font-urbanist-semibold">
                Add Word
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-borderColor dark:border-borderDark p-3 rounded-lg items-center"
              onPress={() => setIsModalVisible(false)}
            >
              <Text className="text-black dark:text-white font-urbanist-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
