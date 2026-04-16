import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";


type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

export default function SignupScreen({ navigation }: Props) {
  const { signup } = useAuth();
  const { colors } = useThemeMode();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    try {
      setError(null);
      await signup(email, password);
    } catch {
      setError("Unable to create account.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Create your Bloom account</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Start logging your cycle with confidence.</Text>
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
      <Button mode="contained" onPress={handleSignup} style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
        Create account
      </Button>
      <Button onPress={() => navigation.navigate("Login")}>Already have an account?</Button>
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
    fontSize: 26,
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
  error: {
    color: "#d94f70",
    marginBottom: 8,
  },
});
