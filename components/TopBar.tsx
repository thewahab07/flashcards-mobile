import { Text, View } from "react-native";
import FilterButton from "./FilterButton";
import SortButton from "./SortButton";
import { useWords } from "@/context/globalContext";
type Props = {
  currentIndex: number;
  scrollToWord: (wordId: number) => void;
};

export default function TopBar({ currentIndex, scrollToWord }: Props) {
  const { displayedWords } = useWords();
  const length = displayedWords?.length ?? 0;
  const current = Math.min(currentIndex + 1, length);

  return (
    <View className="justify-between items-center flex-row pt-1 dark:bg-backgroundDark bg-background border-b border-borderColor dark:border-borderDark absolute top-0 w-full px-6 h-20">
      <View>
        <Text className="text-3xl text-primary font-hanaleiFill-regular">
          Flash
        </Text>
      </View>
      <View className="flex-row justify-around items-center w-[55%]">
        <View>
          <Text className="text-xl font-urbanist-semibold text-[#9ca3af]">
            {`${current} / ${length}`}
          </Text>
        </View>
        <FilterButton scrollToWord={scrollToWord} />
        <SortButton scrollToWord={scrollToWord} />
      </View>
    </View>
  );
}
