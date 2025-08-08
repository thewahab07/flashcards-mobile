import { Download, Upload } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useWords } from "../../context/globalContext";
import { useTheme } from "../../context/themeContext";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform, Alert, ToastAndroid } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WordItem } from "@/types";
import RNFS from "react-native-fs";
import {
  InterstitialAd,
  AdEventType,
  // TestIds,
} from "react-native-google-mobile-ads";
import Constants from "expo-constants";

const ImportExport = () => {
  const { words, setWords, setDisplayedWords } = useWords();
  const { colorScheme } = useTheme();
  const isDarkMode = colorScheme === "dark";
  const interstitialId = Constants.expoConfig?.extra?.admobInterstitialId;
  const ad = useRef(
    InterstitialAd.createForAdRequest(interstitialId) // TestIds.INTERSTITIAL
  ).current;
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    const loadListener = ad.addAdEventListener(AdEventType.LOADED, () =>
      setAdLoaded(true)
    );
    const closeListener = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setAdLoaded(false);
      ad.load(); // preload next one
    });

    ad.load(); // load ad immediately on mount

    return () => {
      loadListener();
      closeListener();
    };
  }, []);

  const exportWords = async () => {
    try {
      const filteredWords = words.map(({ id, ...rest }) => rest);
      const json = JSON.stringify(filteredWords, null, 2);

      let filePath = "";

      if (Platform.OS === "android") {
        // Save directly to Downloads folder
        const fileName = "words.json";
        filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
        await RNFS.writeFile(filePath, json, "utf8");

        ToastAndroid.show("Saved to Downloads! 📁", ToastAndroid.SHORT);
      } else {
        // Fallback for iOS or Expo (if not fully ejected yet)
        const fileUri = FileSystem.documentDirectory + "words.json";
        await FileSystem.writeAsStringAsync(fileUri, json, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        await Sharing.shareAsync(fileUri);
        Alert.alert(
          "Exported!",
          "Your words have been exported successfully 📁"
        );
      }
      if (adLoaded) ad.show();

      //console.log("Exported file path:", filePath);
    } catch (error) {
      //console.error("Export failed:", error);
      Alert.alert("Error", "Failed to export words.");
    }
  };
  const importWords = async () => {
    try {
      // Pick file
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      // Access the file info from result.assets[0]
      const file = result.assets[0];

      const fileContent = await FileSystem.readAsStringAsync(file.uri);

      let importedWords;
      try {
        importedWords = JSON.parse(fileContent);
      } catch {
        Alert.alert("Error", "Invalid JSON format! ❌");
        return;
      }

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
            id: Math.random(), // Generate new ID
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
      if (adLoaded) {
        ad.show();
      } else {
        //console.log("not loaded.");
      }
    } catch (error) {
      console.error("Import failed:", error);
      Alert.alert("Error", "Failed to import words.");
    }
  };

  return (
    <View className="w-full h-full px-6">
      <View className="w-full items-center space-y-2">
        <TouchableOpacity
          onPress={() => {
            exportWords();
          }}
          className="w-full border-none shadow-none flex-row items-center justify-between py-5 px-4 rounded-xl"
        >
          <View className="flex-row items-center">
            <Text className="ml-2 text-lg font-urbanist-semibold text-black dark:text-white">
              Export
            </Text>
          </View>
          <Upload color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            importWords();
          }}
          className="w-full border-y border-borderColor dark:border-borderDark shadow-none flex-row items-center justify-between py-5 px-4 rounded-xl"
        >
          <View className="flex-row items-center">
            <Text className="ml-2 text-lg font-urbanist-semibold text-black dark:text-white">
              Import
            </Text>
          </View>
          <Download color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ImportExport;
