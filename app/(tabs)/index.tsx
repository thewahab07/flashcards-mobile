import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Alert,
  Touchable,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useWords } from "../context/globalContext";
import { toast } from "sonner-native";
import {
  Pressable,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { Delete, Trash } from "lucide-react-native";
interface WordItem {
  word: string;
  definition: string;
  tags: Array<string>;
  id: number;
}
const { height } = Dimensions.get("window");
export default function Home() {
  const { words, setWords, displayedWords, setDisplayedWords } = useWords();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [visibleDefinitions, setVisibleDefinitions] = useState<{
    [key: number]: boolean;
  }>({});

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
          pagingEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 0 }}
          className="w-full h-full"
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
                            className="border border-[#ccc] my-2 mx-1 px-2 py-1 rounded-xl"
                          >
                            {tags}
                          </Text>
                        ))}
                      </View>
                    </View>
                  ) : (
                    <Text className="text-5xl font-bold">{item.word}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      <View className="h-full w-[14%] absolute right-0  pt-36 items-center">
        <Trash
          onPress={() => {
            setIsDeleteDialogOpen(true);
          }}
          size={32}
          color={"black"}
        />
      </View>
      <View className="justify-center pt-1 bg-gray-100/90 border-b border-[#ccc] absolute top-0 w-full px-6 h-20">
        <Text className="text-3xl font-bold">Flash</Text>
      </View>
      <Modal
        visible={isDeleteDialogOpen}
        animationType="fade"
        transparent={true}
      >
        <View className="justify-center flex-1 bg-[rgba(0,0,0,0.5)]">
          <View className="bg-white w-[90%] self-center rounded-lg border border-borderColor p-6">
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
