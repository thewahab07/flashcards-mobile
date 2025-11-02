import { Loader } from "lucide-react-native";
import React from "react";
import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { useColorScheme } from "nativewind";
import { useTheme } from "../../context/themeContext";
import { useWords } from "@/context/globalContext";
type ThemeProps = {
  requestAdAction: (
    action: { type: "theme"; payload: any },
    onReward: () => void,
    onClose?: () => void
  ) => void;
  isLoadingAd: boolean;
  currentPendingPayload: "light" | "dark" | null;
};

const Theme = ({
  requestAdAction,
  isLoadingAd,
  currentPendingPayload,
}: ThemeProps) => {
  const { theme, setTheme } = useTheme();
  const { isOnline } = useWords();
  const { toggleColorScheme } = useColorScheme();
  const handleThemeChange = (mode: "light" | "dark") => {
    if (!isOnline) {
      toggleColorScheme();
      setTheme(mode);
      return;
    }
    requestAdAction(
      { type: "theme", payload: mode },
      () => {
        toggleColorScheme();
        setTheme(mode);
      },
      () => {
        // Ad closed without reward - cleanup
      }
    );
  };

  const renderOption = (label: string, mode: "light" | "dark") => (
    <TouchableOpacity
      disabled={theme === mode || isLoadingAd}
      onPress={() => handleThemeChange(mode)}
      className={`w-[40%] h-48 border-none shadow-none items-center justify-between rounded-2xl`}
    >
      <View className="w-full h-full items-center rounded-3xl">
        <ImageBackground
          key={`${mode}-${theme}`}
          fadeDuration={0}
          source={
            mode == "light"
              ? require("../../assets/images/lightTheme.jpeg")
              : require("../../assets/images/darkTheme.jpeg")
          }
          className={`w-full h-48 rounded-3xl overflow-hidden justify-end ${theme == mode ? "border-2 border-primary/40" : "border-none"}`}
          resizeMode="cover"
        >
          <View className="flex-row py-1 justify-center w-full">
            {isLoadingAd && currentPendingPayload === mode ? (
              <Loader color={mode == "light" ? "black" : "white"} />
            ) : (
              <Text
                className={`text-lg font-urbanist-semibold ${mode == "light" ? "text-black" : "text-white"}`}
              >
                {label}
              </Text>
            )}
          </View>
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );
  return (
    <View className="w-full px-4 my-4 bg-white dark:bg-gray-800 rounded-3xl">
      <View className="py-4 border-b border-borderColor dark:border-borderDark">
        <Text className="text-2xl text-black dark:text-white font-urbanist-bold">
          Theme
        </Text>
      </View>
      <View className="w-full flex-row justify-around py-4">
        {renderOption("Light", "light")}
        {renderOption("Dark", "dark")}
      </View>
    </View>
  );
};

export default Theme;
