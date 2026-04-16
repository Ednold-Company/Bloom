import React, { useEffect, useState } from "react";
import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { configureNotifications } from "./src/services/notifications";
import { ThemeProvider, useThemeMode } from "./src/context/ThemeContext";

function AppShell() {
  const [queryClient] = useState(() => new QueryClient());
  const { paperTheme } = useThemeMode();

  useEffect(() => {
    configureNotifications();
  }, []);

  return (
    <PaperProvider theme={paperTheme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
