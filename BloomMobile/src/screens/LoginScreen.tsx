import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";


type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { login, anonymous } = useAuth();
  const { colors } = useThemeMode();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
      await login(email, password);
    } catch {
      setError("Unable to sign in. Check your credentials.");
    }
  };

  const handleAnonymous = async () => {
    try {
      setError(null);
      await anonymous();
    } catch {
      setError("Unable to start anonymous session.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Welcome to Bloom</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Track your cycle with gentle guidance.</Text>
      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        style={[styles.input, { backgroundColor: colors.surface }]}
      />
      <TextInput
        label="Password"
        mode="outlined"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, { backgroundColor: colors.surface }]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button mode="contained" onPress={handleLogin} style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
        Sign In
      </Button>
      <Button mode="outlined" onPress={handleAnonymous} style={[styles.secondaryButton, { borderColor: colors.primary }]}>
        Continue Anonymously
      </Button>
      <Button onPress={() => navigation.navigate("Signup")}>
        Create an account
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
  },
  primaryButton: {
    marginTop: 8,
  },
  secondaryButton: {
    marginTop: 8,
  },
  error: {
    color: "#d94f70",
    marginBottom: 8,
  },
});
