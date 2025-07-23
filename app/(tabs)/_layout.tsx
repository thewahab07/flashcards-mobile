import { Slot, usePathname } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { useWords } from "../../context/globalContext";

export default function TabLayout() {
  const { setActiveWho } = useWords();
  const pathname = usePathname();
  const isHome = pathname.endsWith("/");
  useEffect(() => {
    if (isHome) {
      setActiveWho(0);
    } else {
      setActiveWho(1);
    }
  }, [pathname]);
  return (
    <View className="dark:bg-backgroundDark dark:text-white bg-background text-black">
      <Slot />
    </View>
  );
}
