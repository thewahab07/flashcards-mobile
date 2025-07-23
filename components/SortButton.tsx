import { useWords } from "@/context/globalContext";
import { router } from "expo-router";
import { Check, SortAsc } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { WordItem } from "@/types";

export default function SortButton() {
  const { words, setDisplayedWords } = useWords();
  const [isSortDialog, setIsSortDialog] = useState(false);
  const [renderType, setRenderType] = useState("dateAsc");
  const shuffleArray = (arr: Array<WordItem>) => {
    return [...arr].sort(() => Math.random() - 0.5);
  };
  useEffect(() => {
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
    if (newDisplayedWords.length > 0) {
      router.setParams({ wordId: newDisplayedWords[0].id.toString() });
    }
  }, [renderType, words]);

  return (
    <>
      <View className="my-4">
        <SortAsc
          onPress={() => {
            setIsSortDialog(true);
          }}
          size={22}
          color="#9ca3af"
        />
      </View>
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
    </>
  );
}
