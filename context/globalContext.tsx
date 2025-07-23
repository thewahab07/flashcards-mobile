import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WordItem, WordsContextType } from "@/types";

const WordsContext = createContext<WordsContextType | undefined>(undefined);

export function WordsProvider({ children }: { children: React.ReactNode }) {
  const [words, setWords] = useState<WordItem[]>([]);
  const [displayedWords, setDisplayedWords] = useState<WordItem[]>([]);
  const [activeWho, setActiveWho] = useState(0);
  const [startTime, setStartTime] = useState(9);
  const [endTime, setEndTime] = useState(21);
  const [interval, setInterval] = useState(40);
  // useEffect to load words and settings
  useEffect(() => {
    async function loadSavedWords() {
      const storedWords = await AsyncStorage.getItem("words");
      if (storedWords) {
        setWords(JSON.parse(storedWords));
        setDisplayedWords(JSON.parse(storedWords));
      }

      const storedStartTime = await AsyncStorage.getItem("startTime");
      const storedEndTime = await AsyncStorage.getItem("endTime");
      const storedInterval = await AsyncStorage.getItem("interval");

      if (storedStartTime) setStartTime(parseInt(storedStartTime));
      if (storedEndTime) setEndTime(parseInt(storedEndTime));
      if (storedInterval) setInterval(parseInt(storedInterval));
    }
    loadSavedWords();
  }, []);
  return (
    <WordsContext.Provider
      value={{
        words,
        setWords,
        displayedWords,
        setDisplayedWords,
        activeWho,
        setActiveWho,
        startTime,
        setStartTime,
        endTime,
        setEndTime,
        interval,
        setInterval,
      }}
    >
      {children}
    </WordsContext.Provider>
  );
}
export function useWords() {
  const context = useContext(WordsContext);
  if (!context) {
    throw new Error("useWords must be used within a WordsProvider");
  }
  return context;
}
