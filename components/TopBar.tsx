import { Text, View } from "react-native";
import FilterButton from "./FilterButton";
import SortButton from "./SortButton";
import { useWords } from "@/app/context/globalContext";
type Props = {
  currentIndex: number;
};

export default function TopBar({ currentIndex }: Props) {
  const { displayedWords } = useWords();

  return (
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
        <FilterButton />
        <SortButton />
      </View>
    </View>
  );
}
