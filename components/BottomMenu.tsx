import React, { useState } from "react";
import { View, Text, TextInput, Modal, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useWords } from "@/app/context/globalContext";
import { HomeIcon, Plus, Settings } from "lucide-react-native";

export default function BottomMenu() {
  const { addWord, isDarkMode } = useWords();
  const [newWord, setNewWord] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [tagValue, setTagValue] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const router = useRouter();

  const handleAddWord = () => {
    const newTags = tagValue
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    addWord(newWord, newDefinition, newTags);

    setNewWord("");
    setNewDefinition("");
    setTagValue("");
    setIsModalVisible(false);
  };

  return (
    <View className="flex-row justify-around pt-1 dark:bg-backgroundDark dark:text-white bg-background text-black border-t border-borderColor absolute bottom-0 w-full">
      <View className="justify-center items-center">
        <TouchableOpacity
          onPress={() => router.push("/")}
          className="px-2 justify-center items-center"
        >
          <HomeIcon size={28} color={isDarkMode ? "white" : "black"} />
          <Text className=" text-xl text-black dark:text-white">Home</Text>
        </TouchableOpacity>
      </View>

      <View className="justify-center items-center ml-4 rounded-full">
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          className="justify-center items-center p-4 rounded-full -mt-[64px] bg-gray-200 dark:bg-[#171717]"
        >
          <Plus size={28} color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
      </View>

      <View className="justify-center items-center">
        <TouchableOpacity
          onPress={() => router.push("./settings")}
          className="px-2 justify-center items-center"
        >
          <Settings size={28} color={isDarkMode ? "white" : "black"} />
          <Text className=" text-xl text-black dark:text-white">Settings</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View className="justify-center flex-1 bg-[rgba(0,0,0,0.5)]">
          <View className="p-5 mx-5 rounded-xl bg-background dark:bg-backgroundDark">
            <TextInput
              placeholder="Enter word"
              placeholderTextColor="#888"
              className="p-[10px] rounded-lg mb-3 border-b border-borderColor text-black dark:text-white"
              value={newWord}
              onChangeText={setNewWord}
            />
            <TextInput
              placeholder="Enter definition"
              placeholderTextColor="#888"
              style={{ textAlignVertical: "top" }}
              className="p-[10px] rounded-lg mb-3 border-b border-borderColor h-24 text-black dark:text-white"
              multiline
              value={newDefinition}
              onChangeText={setNewDefinition}
            />
            <TextInput
              placeholder="Enter tags (comma separated)"
              placeholderTextColor="#888"
              className="p-[10px] rounded-lg mb-3 border-b border-borderColor text-black dark:text-white"
              value={tagValue}
              onChangeText={setTagValue}
            />

            <TouchableOpacity
              className="bg-backgroundDark dark:bg-background p-3 rounded-lg items-center mb-2"
              onPress={handleAddWord}
            >
              <Text className="text-white font-extrabold dark:text-black">
                Add Word
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-borderColor p-3 rounded-lg items-center"
              onPress={() => setIsModalVisible(false)}
            >
              <Text className="font-semibold text-black dark:text-white">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
