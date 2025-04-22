import { Download, Upload } from "lucide-react-native";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useWords } from "../context/globalContext";

const ImportExport = () => {
  const { exportWords, importWords, isDarkMode } = useWords();

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
            <Text className="ml-2 text-lg font-medium text-black dark:text-white">
              Export
            </Text>
          </View>
          <Upload color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            importWords();
          }}
          className="w-full border-y border-borderColor shadow-none flex-row items-center justify-between py-5 px-4 rounded-xl"
        >
          <View className="flex-row items-center">
            <Text className="ml-2 text-lg font-medium text-black dark:text-white">
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
