import { useWords } from "@/context/globalContext";
import { Filter } from "lucide-react-native";
import { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
type Props = {
  scrollToWord: (wordId: number) => void;
};
export default function FilterButton({ scrollToWord }: Props) {
  const { words, setDisplayedWords, displayedWords } = useWords();
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = () => {
    const tempId = displayedWords[0]?.id;
    scrollToWord(tempId);
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
  const uniqueTags = Array.from(
    new Set(words.flatMap((word) => word.tags.map((tag) => tag.toLowerCase())))
  );
  return (
    <>
      <View>
        <Filter
          onPress={() => {
            setIsSearchDialogOpen(true);
          }}
          size={22}
          color="#9ca3af"
        />
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
    </>
  );
}
