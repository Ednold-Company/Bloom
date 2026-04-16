import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { lightColors, darkColors, buildPaperTheme } from "../theme/theme";

export type ThemeMode = "system" | "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: "light" | "dark";
  colors: typeof lightColors;
  paperTheme: ReturnType<typeof buildPaperTheme>;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme() === "dark" ? "dark" : "light";
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem("bloom_theme_mode").then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setModeState(stored);
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("bloom_theme_mode", mode);
  }, [mode]);

  const resolved = mode === "system" ? system : mode;
  const colors = resolved === "dark" ? darkColors : lightColors;
  const paperTheme = buildPaperTheme(resolved);

  const value = useMemo(
    () => ({
      mode,
      resolved,
      colors,
      paperTheme,
      setMode: (next: ThemeMode) => setModeState(next),
    }),
    [mode, resolved, colors, paperTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useThemeMode must be used within ThemeProvider");
  return context;
}
