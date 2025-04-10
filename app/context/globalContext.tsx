import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Word {
  word: string;
  definition: string;
  tags: string[];
  id: number;
}

interface WordsContextType {
  words: Word[];
  setWords: React.Dispatch<React.SetStateAction<Word[]>>;
  displayedWords: Word[];
  setDisplayedWords: React.Dispatch<React.SetStateAction<Word[]>>;
  addWord: (word: string, definition: string, tags: string[]) => void;
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  isSystem: boolean;
  setIsSystem: React.Dispatch<React.SetStateAction<boolean>>;
  exportWords: () => void;
  importWords: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
const WordsContext = createContext<WordsContextType | undefined>(undefined);

export function WordsProvider({ children }: { children: React.ReactNode }) {
  const [words, setWords] = useState<Word[]>([]);
  const [displayedWords, setDisplayedWords] = useState<Word[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSystem, setIsSystem] = useState(false);

  useEffect(() => {
    async function loadSavedWords() {
      const storedWords = await AsyncStorage.getItem("words");
      if (storedWords) {
        setWords(JSON.parse(storedWords));
        setDisplayedWords(JSON.parse(storedWords));
      }
    }
    loadSavedWords();
  }, []);
//   useEffect(() => {
//     const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");

//     const applyTheme = async () => {
//       const storedTheme = await AsyncStorage.getItem("theme");

//       if (storedTheme === "dark") {
//         document.documentElement.classList.add("dark");
//         setIsDarkMode(true);
//         setIsSystem(false);
//       } else if (storedTheme === "light") {
//         document.documentElement.classList.remove("dark");
//         setIsDarkMode(false);
//         setIsSystem(false);
//       } else {
//         const isSystemDark = systemPrefersDark.matches;
//         document.documentElement.classList.toggle("dark", isSystemDark);
//         setIsDarkMode(isSystemDark);
//         setIsSystem(true);
//       }
//     };
//     applyTheme();
//     const systemThemeChangeHandler = (e: MediaQueryListEvent) => {
//       if (isSystem) {
//         document.documentElement.classList.toggle("dark", e.matches);
//         setIsDarkMode(e.matches);
//       }
//     };

//     systemPrefersDark.addEventListener("change", systemThemeChangeHandler);

//     return () => {
//       systemPrefersDark.removeEventListener("change", systemThemeChangeHandler);
//     };
//   }, [isSystem]);
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
        },
      ];
      setWords(updatedWords);
      setDisplayedWords(updatedWords);
      AsyncStorage.setItem("words", JSON.stringify(updatedWords));

      toast.success("Another word enters the Hall of Knowledge! 🏛️");
    }
  };
  const exportWords = () => {
    if (words.length === 0) {
      toast.error("No words to export! 📭");
      return;
    }
    const importedWords = words.map((word) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = word;
      return rest;
    });
    const dataStr = JSON.stringify(importedWords, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "words.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Your words have been exported successfully! 📁");
  };

  const importWords = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedWords: Word[] = JSON.parse(e.target?.result as string);
        const updatedWords = [...words];

        importedWords.forEach((importedWord) => {
          const { word, definition, tags = [] } = importedWord;
          const existingWordIndex = updatedWords.findIndex(
            (w) => w.word === word
          );

          if (existingWordIndex !== -1) {
            const existingWord = updatedWords[existingWordIndex];
            const mergedTags = Array.from(
              new Set([...existingWord.tags, ...tags])
            );

            updatedWords[existingWordIndex] = {
              ...existingWord,
              tags: mergedTags,
            };
          } else {
            updatedWords.push({
              word,
              definition,
              tags: tags || [],
              id: Math.random(),
            });
          }
        });

        setWords(updatedWords);
        setDisplayedWords(updatedWords);
        AsyncStorage.setItem("words", JSON.stringify(updatedWords));

        toast.success("Words imported successfully with new IDs! 📥");
      } catch {
        toast.error("Invalid JSON file format! ❌");
      }
    };

    reader.readAsText(file);
  };

  return (
    <WordsContext.Provider
      value={{
        words,
        setWords,
        displayedWords,
        setDisplayedWords,
        addWord,
        isDarkMode,
        setIsDarkMode,
        isSystem,
        setIsSystem,
        exportWords,
        importWords,
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
