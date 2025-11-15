import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  Keyboard,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import { useRouter } from "expo-router";
import { useWords } from "@/context/globalContext";
import {
  HomeIcon,
  Loader,
  Plus,
  Settings,
  Sparkles,
} from "lucide-react-native";
import { useTheme } from "@/context/themeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { generateDefinition } from "@/utils/gemini";

export default function BottomMenu() {
  const { colorScheme } = useTheme();
  const isDarkMode = colorScheme === "dark";
  const { activeWho, words, setWords, setDisplayedWords } = useWords();
  const [newWord, setNewWord] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [tagValue, setTagValue] = useState("");
  const [wordAddCount, setWordAddCount] = useState(0);
  const [loadingDef, setLoadingDef] = useState(false);
  // BottomSheet refs and snap points
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["75%", "90%"], []);
  // Backdrop component
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
        opacity={0.5}
      />
    ),
    []
  );

  const interstitialId = Constants.expoConfig?.extra?.admobInterstitialId;
  const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : interstitialId;
  //const adUnitId = TestIds.INTERSTITIAL;
  const adRef = useRef(InterstitialAd.createForAdRequest(adUnitId)).current;
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

      ToastAndroid.show(
        "Another word enters the Hall of Knowledge! 🏛️",
        ToastAndroid.SHORT
      );
      setWordAddCount((prev) => {
        const newCount = prev + 1;
        if (newCount % 3 === 0 && adLoaded) {
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
    if (newWord.trim() === "") {
      ToastAndroid.show("Please add a word.", ToastAndroid.SHORT);
      return;
    } else if (newDefinition.trim() === "") {
      ToastAndroid.show("Please add a definition.", ToastAndroid.SHORT);
      return;
    }
    addWord(newWord, newDefinition, newTags);

    setNewWord("");
    setNewDefinition("");
    setTagValue("");
    Keyboard.dismiss();
    bottomSheetRef.current?.close();
  };
  const handleOpenBottomSheet = () => {
    bottomSheetRef.current?.expand();
  };
  const handleCloseBottomSheet = () => {
    Keyboard.dismiss();
    setNewWord("");
    setNewDefinition("");
    setTagValue("");
    bottomSheetRef.current?.close();
  };
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      // Sheet is closed
      Keyboard.dismiss();
      setNewWord("");
      setNewDefinition("");
      setTagValue("");
    }
  }, []);

  const handleGenerateByAI = async () => {
    if (!newWord.trim()) {
      ToastAndroid.show("Please enter a word first.", ToastAndroid.SHORT);
      return;
    }
    setLoadingDef(true);
    ToastAndroid.show("Generating definition...", ToastAndroid.SHORT);

    try {
      const definition = await generateDefinition(newWord.trim(), words);
      setNewDefinition(definition);
      setLoadingDef(false);
      //ToastAndroid.show("Definition generated!", ToastAndroid.SHORT);
    } catch (error) {
      setLoadingDef(false);
      ToastAndroid.show(
        "Ai not working rn, Try again later.",
        ToastAndroid.SHORT
      );
    }
  };
  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        onChange={handleSheetChanges}
        backgroundStyle={{
          backgroundColor: isDarkMode ? "#111827" : "#f8fafc",
        }}
        handleIndicatorStyle={{
          backgroundColor: isDarkMode ? "#888" : "#ccc",
          width: "20%",
        }}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetView className="p-5">
          <Text className="text-xl font-urbanist-bold text-black dark:text-white mb-4">
            Add New Card
          </Text>

          <BottomSheetTextInput
            placeholder="Enter word"
            placeholderTextColor="#888"
            className="p-[10px] rounded-lg mb-3 border-b border-borderColor dark:border-borderDark focus:border-primary text-black dark:text-white font-urbanist-medium"
            value={newWord}
            onChangeText={setNewWord}
          />
          <View>
            <View className="absolute right-0 z-10">
              <TouchableOpacity
                className="bg-primary p-3 my-2 rounded-full items-center justify-center w-12 h-12"
                onPress={handleGenerateByAI}
              >
                {loadingDef ? (
                  <Loader size={20} color={"#ffffff"} />
                ) : (
                  <Sparkles size={20} color={"#ffffff"} />
                )}
              </TouchableOpacity>
            </View>
            <BottomSheetTextInput
              placeholder="Enter definition"
              placeholderTextColor="#888"
              style={{ textAlignVertical: "top" }}
              className="p-[10px] rounded-lg mb-3 border-b border-borderColor dark:border-borderDark focus:border-primary h-24 text-black dark:text-white font-urbanist-medium"
              multiline
              value={newDefinition}
              onChangeText={setNewDefinition}
            />
          </View>
          <BottomSheetTextInput
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
            <Text className="text-white font-urbanist-semibold px-4 tracking-wide">
              Add Card
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="border border-borderColor dark:border-borderDark p-3 rounded-lg items-center"
            onPress={handleCloseBottomSheet}
          >
            <Text className="text-black dark:text-white font-urbanist-semibold">
              Cancel
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
      <SafeAreaView>
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
                color={
                  activeWho === 0 ? "#7c4dff" : isDarkMode ? "white" : "black"
                }
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
                onPress={handleOpenBottomSheet}
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
                color={
                  activeWho === 1 ? "#7c4dff" : isDarkMode ? "white" : "black"
                }
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
        </View>
      </SafeAreaView>
    </>
  );
}
