import React, { useState } from "react";
import { View, Text, TextInput, Modal, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useWords } from "@/app/context/globalContext";
import { HomeIcon, Plus, Settings } from "lucide-react-native";

export default function BottomMenu() {
  const { addWord } = useWords();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [tagValue, setTagValue] = useState("");

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
    <View className="flex-row justify-around pt-1 border-t border-[#ccc] absolute bottom-0 w-full">
      <View className="justify-center items-center">
        <TouchableOpacity
          onPress={() => router.push("/")}
          className="px-2 justify-center items-center"
        >
          <HomeIcon size={28} color="black" />
          <Text className=" text-xl">Home</Text>
        </TouchableOpacity>
      </View>

      <View className="justify-center items-center ml-4 rounded-full">
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          className="justify-center items-center p-4 rounded-full -mt-[64px] bg-gray-200"
        >
          <Plus size={28} color="black" />
        </TouchableOpacity>
      </View>

      <View className="justify-center items-center">
        <TouchableOpacity
          onPress={() => router.push("./settings")}
          className="px-2 justify-center items-center"
        >
          <Settings size={28} color="black" />
          <Text className=" text-xl">Settings</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View className="justify-center flex-1 bg-[rgba(0,0,0,0.5)]">
          <View className="p-5 mx-5 rounded-xl bg-gray-100">
            <TextInput
              placeholder="Enter word"
              placeholderTextColor="#888"
              className="p-[10px] rounded-lg mb-3 border-b border-gray-800"
              value={newWord}
              onChangeText={setNewWord}
            />
            <TextInput
              placeholder="Enter definition"
              placeholderTextColor="#888"
              style={{ textAlignVertical: "top" }}
              className="p-[10px] rounded-lg mb-3 border-b border-gray-800 h-24"
              multiline
              value={newDefinition}
              onChangeText={setNewDefinition}
            />
            <TextInput
              placeholder="Enter tags (comma separated)"
              placeholderTextColor="#888"
              className="p-[10px] rounded-lg mb-3 border-b border-gray-800"
              value={tagValue}
              onChangeText={setTagValue}
            />

            <TouchableOpacity
              className="bg-gray-900 p-3 rounded-lg items-center mb-2"
              onPress={handleAddWord}
            >
              <Text className="text-white font-extrabold">Add Word</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-gray-800 p-3 rounded-lg items-center"
              onPress={() => setIsModalVisible(false)}
            >
              <Text className="font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
