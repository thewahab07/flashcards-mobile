import { Download, Loader, Upload } from "lucide-react-native";
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

  // const adUnitId = __DEV__
  //   ? TestIds.REWARDED_INTERSTITIAL
  //   : rewardedInterstitialId;
  const adUnitId = TestIds.REWARDED_INTERSTITIAL;
  const ad = useRef(
    RewardedInterstitialAd.createForAdRequest(adUnitId)
  ).current;
  const [loadingAd, setLoadingAd] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    null | "import" | "export"
  >(null);
  useEffect(() => {
    let rewardEarned = false;
    const loadListener = ad.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setLoadingAd(false);
        ad.show();
      }
    );

    const earnListener = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        rewardEarned = true;
      }
    );

    const closeListener = ad.addAdEventListener(AdEventType.CLOSED, () => {
      if (rewardEarned) {
        if (pendingAction === "import") handleImport();
        if (pendingAction === "export") handleExport();
      }
      setPendingAction(null);
      setLoadingAd(false);
      rewardEarned = false;
    });

    return () => {
      loadListener();
      earnListener();
      closeListener();
    };
  }, [pendingAction]);
  // Export logic (runs only after reward earned)
  const handleExport = async () => {
    if (words.length == 0) {
      ToastAndroid.show("No words to export.", ToastAndroid.SHORT);
      return;
    }
    try {
      const filteredWords = words.map(({ id, ...rest }) => rest);
      const json = JSON.stringify(filteredWords, null, 2);

      // Generate unique filename with date + time
      const now = new Date();
      const pad = (n: number) => (n < 10 ? "0" + n : n.toString());
      const date =
        pad(now.getDate()) +
        "-" +
        pad(now.getMonth() + 1) +
        "-" +
        now.getFullYear();
      const time = pad(now.getHours()) + pad(now.getMinutes());
      const fileName = `words-${date}-${time}.json`;
      const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      await RNFS.writeFile(filePath, json, "utf8");
      ToastAndroid.show("Saved to Downloads! 📁", ToastAndroid.SHORT);
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
      if (result.canceled) {
        ToastAndroid.show("No file selected.", ToastAndroid.SHORT);
        return;
      }

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
    if (!isOnline) {
      action === "import" ? handleImport() : handleExport();
      return;
    }

    setPendingAction(action);
    setLoadingAd(true);
    ad.load();
  };

  return (
    <View className="w-full h-full px-6">
      <View className="w-full items-center space-y-2">
        <TouchableOpacity
          onPress={() => showAdOrRun("import")}
          className="w-full border-y border-borderColor dark:border-borderDark flex-row items-center justify-between py-5 px-4 rounded-xl"
        >
          <Text className="ml-2 text-lg font-urbanist-semibold text-black dark:text-white">
            Import
          </Text>
          {loadingAd && pendingAction === "import" ? (
            <Loader color={isDarkMode ? "white" : "black"} />
          ) : (
            <Download color={isDarkMode ? "white" : "black"} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => showAdOrRun("export")}
          className="w-full flex-row items-center justify-between py-5 px-4 rounded-xl"
        >
          <Text className="ml-2 text-lg font-urbanist-semibold text-black dark:text-white">
            Export
          </Text>
          {loadingAd && pendingAction === "export" ? (
            <Loader color={isDarkMode ? "white" : "black"} />
          ) : (
            <Upload color={isDarkMode ? "white" : "black"} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ImportExport;
