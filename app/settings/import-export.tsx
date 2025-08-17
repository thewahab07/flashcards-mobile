import { Download, Upload } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  ToastAndroid,
} from "react-native";
import { useWords } from "../../context/globalContext";
import { useTheme } from "../../context/themeContext";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WordItem } from "@/types";
import RNFS from "react-native-fs";
import {
  RewardedInterstitialAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";
import Constants from "expo-constants";

const ImportExport = () => {
  const { words, setWords, setDisplayedWords, isOnline } = useWords();
  const { colorScheme } = useTheme();
  const isDarkMode = colorScheme === "dark";

  const rewardedInterstitialId =
    Constants.expoConfig?.extra?.admobRewardedInterstitialId;

  const adUnitId = __DEV__
    ? TestIds.REWARDED_INTERSTITIAL
    : rewardedInterstitialId;
  const ad = useRef(
    RewardedInterstitialAd.createForAdRequest(adUnitId)
  ).current;
  const [adLoaded, setAdLoaded] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    null | "import" | "export"
  >(null);

  useEffect(() => {
    const loadListener = ad.addAdEventListener(RewardedAdEventType.LOADED, () =>
      setAdLoaded(true)
    );

    const earnListener = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        if (pendingAction === "import") handleImport();
        if (pendingAction === "export") handleExport();
        setPendingAction(null);
      }
    );

    const closeListener = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setAdLoaded(false);
      ad.load(); // Preload next one
    });

    ad.load();

    return () => {
      loadListener();
      earnListener();
      closeListener();
    };
  }, [pendingAction]);

  // Export logic (runs only after reward earned)
  const handleExport = async () => {
    try {
      const filteredWords = words.map(({ id, ...rest }) => rest);
      const json = JSON.stringify(filteredWords, null, 2);

      if (Platform.OS === "android") {
        const fileName = "words.json";
        const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
        await RNFS.writeFile(filePath, json, "utf8");
        ToastAndroid.show("Saved to Downloads! 📁", ToastAndroid.SHORT);
      } else {
        const fileUri = FileSystem.documentDirectory + "words.json";
        await FileSystem.writeAsStringAsync(fileUri, json, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        await Sharing.shareAsync(fileUri);
        Alert.alert("Exported!", "Your words have been exported 📁");
      }
    } catch (error) {
      ToastAndroid.show(
        "Failed to export words, Try again later",
        ToastAndroid.SHORT
      );
    }
  };

  // Import logic (runs only after reward earned)
  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file = result.assets[0];
      const fileContent = await FileSystem.readAsStringAsync(file.uri);
      let importedWords = JSON.parse(fileContent);

      const updatedWords = [...words];
      importedWords.forEach((importedWord: WordItem) => {
        const { word, definition, tags = [] } = importedWord;
        const existingIndex = updatedWords.findIndex((w) => w.word === word);

        if (existingIndex !== -1) {
          const existingWord = updatedWords[existingIndex];
          const mergedTags = Array.from(
            new Set([...existingWord.tags, ...tags])
          );
          updatedWords[existingIndex] = { ...existingWord, tags: mergedTags };
        } else {
          updatedWords.push({
            word,
            definition,
            tags,
            id: Math.random(),
            isMarked: false,
          });
        }
      });

      setWords(updatedWords);
      setDisplayedWords(updatedWords);
      await AsyncStorage.setItem("words", JSON.stringify(updatedWords));

      Platform.OS === "android"
        ? ToastAndroid.show("Imported successfully! 📥", ToastAndroid.SHORT)
        : Alert.alert("Success", "Words imported! 📥");
    } catch (error) {
      Alert.alert("Error", "Failed to import words.");
    }
  };

  const showAdOrRun = (action: "import" | "export") => {
    if (adLoaded) {
      setPendingAction(action);
      ad.show();
    } else {
      // If ad not loaded, fallback to running immediately
      action === "import" ? handleImport() : handleExport();
    }
  };

  return (
    <View className="w-full h-full px-6">
      <View className="w-full items-center space-y-2">
        <TouchableOpacity
          onPress={() => showAdOrRun("export")}
          className="w-full flex-row items-center justify-between py-5 px-4 rounded-xl"
        >
          <Text className="ml-2 text-lg font-urbanist-semibold text-black dark:text-white">
            Export
          </Text>
          <Upload color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => showAdOrRun("import")}
          className="w-full border-y border-borderColor dark:border-borderDark flex-row items-center justify-between py-5 px-4 rounded-xl"
        >
          <Text className="ml-2 text-lg font-urbanist-semibold text-black dark:text-white">
            Import
          </Text>
          <Download color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ImportExport;
