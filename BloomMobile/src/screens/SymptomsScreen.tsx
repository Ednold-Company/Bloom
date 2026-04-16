import React, { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";
import api from "../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function SymptomsScreen() {
  const { token } = useAuth();
  const { colors } = useThemeMode();
  const queryClient = useQueryClient();
  const [date, setDate] = useState("");
  const [mood, setMood] = useState("");
  const [cramps, setCramps] = useState("");
  const [sleep, setSleep] = useState("");
  const [energy, setEnergy] = useState("");
  const [notes, setNotes] = useState("");

  const symptomsQuery = useQuery({
    queryKey: ["symptoms", token],
    queryFn: async () => {
      const response = await api.get("/symptoms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.symptoms;
    },
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(
        "/symptoms",
        {
          date,
          mood,
          cramps: cramps ? Number(cramps) : undefined,
          sleep: sleep ? Number(sleep) : undefined,
          energy: energy ? Number(energy) : undefined,
          notes: notes || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.symptom;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["symptoms"] });
      setDate("");
      setMood("");
      setCramps("");
      setSleep("");
      setEnergy("");
      setNotes("");
    },
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Log Symptoms</Text>
      <Card style={[styles.card, { backgroundColor: colors.surface }]}> 
        <Card.Content>
          <TextInput label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} style={styles.input} />
          <TextInput label="Mood" value={mood} onChangeText={setMood} style={styles.input} />
          <TextInput label="Cramps (1-5)" value={cramps} onChangeText={setCramps} style={styles.input} />
          <TextInput label="Sleep (1-5)" value={sleep} onChangeText={setSleep} style={styles.input} />
          <TextInput label="Energy (1-5)" value={energy} onChangeText={setEnergy} style={styles.input} />
          <TextInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            style={[styles.input, styles.notesInput]}
            multiline
          />
          <Button mode="contained" onPress={() => createMutation.mutate()} style={[styles.primaryButton, { backgroundColor: colors.primary }]}> 
            Save symptoms
          </Button>
        </Card.Content>
      </Card>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent entries</Text>
      {symptomsQuery.data?.length ? (
        symptomsQuery.data.slice(0, 5).map((item: any) => (
          <Card key={item.id} style={[styles.entryCard, { backgroundColor: colors.surface }]}> 
            <Card.Content>
              <Text>{new Date(item.date).toDateString()}</Text>
              <Text style={[styles.cardText, { color: colors.muted }]}>Mood: {item.mood || "-"}</Text>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Text style={[styles.helperText, { color: colors.muted }]}>No symptoms logged yet.</Text>
      )}
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
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  card: {
    marginBottom: 16,
  },
  entryCard: {
    marginBottom: 12,
  },
  input: {
    marginBottom: 8,
  },
  primaryButton: {
    marginTop: 8,
  },
  cardText: {
    marginTop: 2,
  },
  notesInput: {
    minHeight: 90,
  },
  helperText: {
    marginBottom: 12,
  },
});
