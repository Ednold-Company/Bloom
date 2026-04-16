import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

export const lightColors = {
  primary: "#ef7a9a",
  secondary: "#f2a3b5",
  background: "#fff7f5",
  surface: "#ffffff",
  text: "#5a2d4b",
  muted: "#9a7b8c",
};

export const darkColors = {
  primary: "#f091ab",
  secondary: "#c46a87",
  background: "#100b13",
  surface: "#1a121d",
  text: "#f7e9f0",
  muted: "#caa9b8",
};

export function buildPaperTheme(mode: "light" | "dark") {
  const base = mode === "dark" ? MD3DarkTheme : MD3LightTheme;
  const colors = mode === "dark" ? darkColors : lightColors;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      secondary: colors.secondary,
      background: colors.background,
      surface: colors.surface,
      onSurface: colors.text,
      onBackground: colors.text,
    },
  };
}
