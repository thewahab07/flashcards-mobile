import { Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import DeleteButton from "./DeleteButton";
import { Bookmark } from "lucide-react-native";
import { useWords } from "@/context/globalContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WordItem } from "@/types";

type Props = {
  id: number;
  height: number;
  toggleDefinition: (id: number) => void;
  visibleDefinitions: { [key: number]: boolean };
  currentIndex: number;
  item: WordItem;
};

export default function WordCard({
  id,
  height,
  toggleDefinition,
  visibleDefinitions,
  currentIndex,
  item,
}: Props) {
  const { words, setWords, setDisplayedWords } = useWords();
  const toggleBookmark = (wordId: number) => {
    const updated = words.map((word) =>
      word.id === wordId ? { ...word, isMarked: !word.isMarked } : word
    );
    setWords(updated);
    setDisplayedWords(updated);
    AsyncStorage.setItem("words", JSON.stringify(updated)); // persist
    ToastAndroid.show(
      "Bookmark toggled — saved it or scrapped it, your call.",
      ToastAndroid.SHORT
    );
  };
  return (
    <View
      key={id}
      style={{ height: height }}
      className="items-center justify-center px-4"
    >
      <View className="w-[85%] h-[55%] items-center justify-center mb-36">
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
                  {item.tags.map((tags: string, num: number) => (
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
  );
}
