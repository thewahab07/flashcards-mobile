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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useWords } from "../context/globalContext";
import { toast } from "sonner-native";
interface WordItem {
  word: string;
  definition: string;
  tags: Array<string>;
  id: number;
}
export default function Home() {
  const [renderType, setRenderType] = useState("dateAsc");
  const { words, setWords, displayedWords, setDisplayedWords } = useWords();
  const [visibleDefinitions, setVisibleDefinitions] = useState<{
    [key: number]: boolean;
  }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);
  const uniqueTags = Array.from(
    new Set(words.flatMap((word) => word.tags.map((tag) => tag.toLowerCase())))
  );
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // useEffect(() => {
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       entries.forEach((entry) => {
  //         if (entry.isIntersecting) {
  //           const index = cardRefs.current.findIndex(
  //             (ref) => ref === entry.target
  //           );
  //           if (index !== -1) {
  //             setCurrentIndex(index);
  //             const currentWordId = displayedWords[index]?.id;
  //             if (currentWordId) {
  //               const url = new URL(window.location.href);
  //               url.searchParams.set("wordId", String(currentWordId));
  //               window.history.replaceState(null, "", url.toString());
  //             }
  //           }
  //         }
  //       });
  //     },
  //     { threshold: 0.5 }
  //   );

  //   cardRefs.current.forEach((ref) => {
  //     if (ref) observer.observe(ref);
  //   });

  //   return () => observer.disconnect();
  // }, [displayedWords]);
  const scrollToWord = (wordId: number) => {
    const index = words.findIndex((word) => word.id === wordId);

    if (index !== -1 && cardRefs.current[index]) {
      cardRefs.current[index].scrollIntoView({ behavior: "smooth" });
      setCurrentIndex(index);
    }
  };
  useEffect(() => {
    async function loadSavedWords() {
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
    }
    loadSavedWords();
  }, [setWords, setDisplayedWords]);
  useEffect(() => {
    // // const params = new URLSearchParams(window.location.search);
    // const wordIndexParam = params.get("wordId");
    // scrollToWord(Number(wordIndexParam));
  }, [words]);
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
  const shuffleArray = (arr: Array<WordItem>) => {
    return [...arr].sort(() => Math.random() - 0.5);
  };
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setDisplayedWords(words);
      setNoResults(false);
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
    setNoResults(filteredWords.length === 0);
  };
  const handleSearchReset = () => {
    setDisplayedWords(words);
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
      <View className="justify-center pt-1 border-b border-[#ccc] absolute top-0 w-full px-6 h-20">
        <Text className="text-3xl font-bold">Flash</Text>
      </View>
    </View>
  );
}
