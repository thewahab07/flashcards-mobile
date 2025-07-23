import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark";

interface ThemeContextProps {
  theme: Theme;
  colorScheme: Theme;
  setTheme: (theme: Theme) => void; // optional now, but kept for future manual override
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  colorScheme: "light",
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme() ?? "light";

  return (
    <ThemeContext.Provider
      value={{
        theme: systemColorScheme,
        colorScheme: systemColorScheme,
        setTheme: () => {}, // noop; you’re not manually changing it
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
