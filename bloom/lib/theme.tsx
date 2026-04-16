"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "system" | "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("bloom_theme_mode") as ThemeMode | null;
    if (stored) {
      setModeState(stored);
    }
  }, []);

  useEffect(() => {
    const system = getSystemTheme();
    const next = mode === "system" ? system : mode;
    setResolved(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    if (document.body) {
      document.body.dataset.theme = next;
      document.body.style.colorScheme = next;
    }
    localStorage.setItem("bloom_theme_mode", mode);
  }, [mode]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (mode === "system") {
        const system = getSystemTheme();
        setResolved(system);
        document.documentElement.dataset.theme = system;
      }
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolved,
      setMode: (next) => setModeState(next),
      toggle: () => setModeState(resolved === "dark" ? "light" : "dark"),
    }),
    [mode, resolved]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within ThemeProvider");
  }
  return context;
}
