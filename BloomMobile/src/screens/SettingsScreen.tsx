import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card, RadioButton, Switch, Text } from "react-native-paper";
import { useThemeMode, ThemeMode } from "../context/ThemeContext";

const PREF_KEYS = {
  period: "bloom_notifications_period",
  fertility: "bloom_notifications_fertility",
  symptoms: "bloom_notifications_symptoms",
};

export default function SettingsScreen() {
  const { mode, setMode, colors } = useThemeMode();
  const [periodReminders, setPeriodReminders] = useState(true);
  const [fertilityReminders, setFertilityReminders] = useState(true);
  const [symptomReminders, setSymptomReminders] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet([PREF_KEYS.period, PREF_KEYS.fertility, PREF_KEYS.symptoms]).then(
      (results) => {
        const nextValues = Object.fromEntries(results);
        if (nextValues[PREF_KEYS.period] != null) {
          setPeriodReminders(nextValues[PREF_KEYS.period] === "true");
        }
        if (nextValues[PREF_KEYS.fertility] != null) {
          setFertilityReminders(nextValues[PREF_KEYS.fertility] === "true");
        }
        if (nextValues[PREF_KEYS.symptoms] != null) {
          setSymptomReminders(nextValues[PREF_KEYS.symptoms] === "true");
        }
      }
    );
  }, []);

  const updatePref = async (key: string, value: boolean, setter: (next: boolean) => void) => {
    setter(value);
    await AsyncStorage.setItem(key, value ? "true" : "false");
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title title="Appearance" />
        <Card.Content>
          <RadioButton.Group onValueChange={(value) => setMode(value as ThemeMode)} value={mode}>
            <RadioButton.Item label="System default" value="system" />
            <RadioButton.Item label="Light" value="light" />
            <RadioButton.Item label="Dark" value="dark" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title title="Notification preferences" />
        <Card.Content>
          <Text style={[styles.helper, { color: colors.muted }]}>
            Choose reminders for period start, fertility window, and symptom check-ins.
          </Text>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: colors.text }]}>Period start reminders</Text>
            <Switch
              value={periodReminders}
              onValueChange={(value) => updatePref(PREF_KEYS.period, value, setPeriodReminders)}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: colors.text }]}>Fertility window reminders</Text>
            <Switch
              value={fertilityReminders}
              onValueChange={(value) => updatePref(PREF_KEYS.fertility, value, setFertilityReminders)}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: colors.text }]}>Symptom logging reminders</Text>
            <Switch
              value={symptomReminders}
              onValueChange={(value) => updatePref(PREF_KEYS.symptoms, value, setSymptomReminders)}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title title="Privacy" />
        <Card.Content>
          <Text style={[styles.helper, { color: colors.muted }]}>
            Bloom respects your data. You can use anonymous mode or delete your data anytime from your profile.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    marginBottom: 16,
  },
  helper: {
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  switchLabel: {
    flex: 1,
    marginRight: 12,
  },
});
