import { Download, Loader, Trash2, Upload } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  ToastAndroid,
  Modal,
} from "react-native";
import { useWords } from "../../context/globalContext";
import { useTheme } from "../../context/themeContext";
import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WordItem } from "@/types";
type ImportExportProps = {
  requestAdAction: (
    action: { type: "import" | "export" | "delete"; payload?: any },
    onReward: () => void,
    onClose?: () => void
  ) => void;
  isLoadingAd: boolean;
  currentPendingAction: "import" | "export" | "delete" | null | undefined;
};

const ImportExport = ({
  requestAdAction,
  isLoadingAd,
  currentPendingAction,
}: ImportExportProps) => {
  const { words, setWords, setDisplayedWords, isOnline } = useWords();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { colorScheme } = useTheme();
  const isDarkMode = colorScheme === "dark";
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
      // Write to app's cache

      const fileUri = FileSystem.cacheDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share or save to Downloads (Android only)

      if (Platform.OS === "android") {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const base64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            "application/json"
          ).then(async (uri) => {
            await FileSystem.writeAsStringAsync(uri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
          });
          ToastAndroid.show("Exported successfully! 📂", ToastAndroid.SHORT);
        } else {
          ToastAndroid.show("Permission denied.", ToastAndroid.SHORT);
        }
      } else {
        ToastAndroid.show("IOS not supported", ToastAndroid.SHORT);
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
      if (result.canceled) {
        ToastAndroid.show("No file selected.", ToastAndroid.SHORT);
        return;
      }

      const file = result.assets[0];
      const fileContent = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
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
  const deleteAllWords = async () => {
    if (words.length === 0) {
      setIsDeleteDialogOpen(false);
      ToastAndroid.show("No cards to delete.", ToastAndroid.SHORT);
      return;
    }

    try {
      setWords([]);
      setDisplayedWords([]);
      await AsyncStorage.removeItem("words");

      ToastAndroid.show(
        "All your flashcards just got Thanos-snapped. 💨",
        ToastAndroid.SHORT
      );
    } catch (error) {
      console.error("Failed to delete all words:", error);
      ToastAndroid.show(
        "Something went wrong while deleting, Try again.",
        ToastAndroid.SHORT
      );
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  const handleAction = (action: "import" | "export" | "delete") => {
    if (!isOnline) {
      action === "import"
        ? handleImport()
        : action == "export"
          ? handleExport()
          : deleteAllWords();
      return;
    }
    requestAdAction(
      { type: action },
      action === "import"
        ? handleImport
        : action === "export"
          ? handleExport
          : deleteAllWords,
      () => {
        // Ad closed without reward - cleanup
      }
    );
  };

  return (
    <>
      <View className="w-full px-4 my-4 bg-white dark:bg-gray-800 rounded-3xl">
        <View className="py-4 border-b border-borderColor dark:border-borderDark">
          <Text className="text-2xl text-black dark:text-white font-urbanist-bold">
            Data Management
          </Text>
        </View>
        <View className="w-full items-center py-4">
          <TouchableOpacity
            onPress={() => handleAction("import")}
            className="w-full flex-row items-center justify-between my-2 py-5 px-4 rounded-xl bg-background dark:bg-backgroundDark"
          >
            <View>
              <Text className="ml-2 text-lg font-urbanist-semibold text-black dark:text-white">
                Import
              </Text>
              <Text className="ml-2 text-sm font-urbanist-medium text-gray-500">
                Add flashcards from JSON file.
              </Text>
            </View>
            {isLoadingAd && currentPendingAction === "import" ? (
              <Loader color={isDarkMode ? "white" : "black"} />
            ) : (
              <Download color={isDarkMode ? "white" : "black"} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleAction("export")}
            className="w-full flex-row items-center justify-between my-2 py-5 px-4 rounded-xl bg-background dark:bg-backgroundDark"
          >
            <View>
              <Text className="ml-2 text-lg font-urbanist-semibold text-black dark:text-white">
                Export
              </Text>
              <Text className="ml-2 text-sm font-urbanist-medium text-gray-500">
                Save your flashcards as JSON file.
              </Text>
            </View>
            {isLoadingAd && currentPendingAction === "export" ? (
              <Loader color={isDarkMode ? "white" : "black"} />
            ) : (
              <Upload color={isDarkMode ? "white" : "black"} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsDeleteDialogOpen(true)}
            className="w-full flex-row items-center justify-between my-2 py-5 px-4 rounded-xl bg-red-50 dark:bg-red-950/20"
          >
            <View>
              <Text className="ml-2 text-lg font-urbanist-semibold text-red-600 dark:text-white">
                Delete all
              </Text>
              <Text className="ml-2 text-sm font-urbanist-medium text-red-500/60">
                Remove all flashcards permanently.
              </Text>
            </View>
            <Trash2 color={isDarkMode ? "#f87171" : "#dc2626"} />
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        visible={isDeleteDialogOpen}
        animationType="fade"
        transparent={true}
      >
        <View className="justify-center flex-1 bg-[rgba(0,0,0,0.5)]">
          <View className="bg-white dark:bg-backgroundDark w-[90%] self-center rounded-lg border border-borderColor dark:border-borderDark p-6">
            <Text className="text-xl font-urbanist-bold text-black dark:text-white mb-1">
              Are you sure?
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-300 mb-6 font-urbanist-medium">
              Do you really want to delete all the cards?
            </Text>
            <View className="flex-row justify-end">
              <TouchableOpacity
                className="px-4 mx-1 py-2 border border-borderColor dark:border-borderDark rounded-md dark:bg-backgroundDark"
                onPress={() => setIsDeleteDialogOpen(false)}
              >
                <Text className="text-black dark:text-white font-urbanist-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isLoadingAd && currentPendingAction === "delete"}
                className="px-4 mx-1 py-2 bg-red-600 rounded-md"
                onPress={() => {
                  handleAction("delete");
                }}
              >
                {isLoadingAd && currentPendingAction === "delete" ? (
                  <Loader color={"#ffffff"} />
                ) : (
                  <Text className="text-white font-urbanist-semibold">
                    Delete
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ImportExport;
