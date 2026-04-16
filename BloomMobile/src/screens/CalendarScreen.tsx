import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Calendar } from "react-native-calendars";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { useThemeMode } from "../context/ThemeContext";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Cycle {
  id: string;
  startDate: string;
  endDate?: string | null;
}

export default function CalendarScreen() {
  const { token } = useAuth();
  const { colors } = useThemeMode();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStart, setEditingStart] = useState("");
  const [editingEnd, setEditingEnd] = useState("");
  const [needsEndPrompt, setNeedsEndPrompt] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const cyclesQuery = useQuery({
    queryKey: ["cycles", token],
    queryFn: async () => {
      const response = await api.get("/cycles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.cycles as Cycle[];
    },
    enabled: !!token,
  });

  const openCycle = cyclesQuery.data?.find((cycle) => !cycle.endDate) ?? null;

  const createCycle = useMutation({
    mutationFn: async () => {
      await api.post(
        "/cycles",
        { startDate, endDate: endDate || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      setNeedsEndPrompt(true);
      setCreateError(null);
      setStartDate("");
      setEndDate("");
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 409) {
        setCreateError("A period start is already logged for this month.");
      } else {
        setCreateError("We couldn't save that cycle. Please try again.");
      }
    },
  });

  const updateCycle = useMutation({
    mutationFn: async (payload: { id: string; startDate: string; endDate?: string }) => {
      await api.put(`/cycles/${payload.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      setEditingId(null);
      setEditingStart("");
      setEditingEnd("");
      setNeedsEndPrompt(false);
      setCreateError(null);
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 409) {
        setCreateError("A period start is already logged for this month.");
      } else {
        setCreateError("We couldn't update that cycle. Please try again.");
      }
    },
  });

  const deleteCycle = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/cycles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
    },
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Cycle Calendar</Text>
      <Calendar
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.surface,
          textSectionTitleColor: colors.muted,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: "#ffffff",
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          monthTextColor: colors.text,
          arrowColor: colors.primary,
        }}
      />
      <Text style={[styles.helper, { color: colors.muted }]}>
        Tap a day to log a period or symptom entry.
      </Text>

      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title title="Log a cycle" />
        <Card.Content>
          <TextInput
            label="Period start date (YYYY-MM-DD)"
            value={startDate}
            onChangeText={setStartDate}
            style={styles.input}
          />
          <TextInput
            label="Period end date (optional)"
            value={endDate}
            onChangeText={setEndDate}
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={() => createCycle.mutate()}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            disabled={createCycle.isPending}
          >
            {createCycle.isPending ? "Saving..." : "Save cycle"}
          </Button>
          {createError ? <Text style={[styles.errorText]}>{createError}</Text> : null}
          {needsEndPrompt && openCycle ? (
            <View style={[styles.endPrompt, { backgroundColor: colors.surface }]}>
              <Text style={[styles.helper, { color: colors.muted }]}>
                You saved a period start. When your period ends, update the end date below.
              </Text>
            </View>
          ) : null}
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title title="Update period end" />
        <Card.Content>
          {openCycle ? (
            <>
              <Text style={[styles.helper, { color: colors.muted }]}>
                Current period started on {new Date(openCycle.startDate).toDateString()}.
              </Text>
              <TextInput
                label="End date (YYYY-MM-DD)"
                value={editingEnd}
                onChangeText={setEditingEnd}
                style={styles.input}
              />
              <Button
                mode="contained"
                onPress={() =>
                  updateCycle.mutate({
                    id: openCycle.id,
                    startDate: openCycle.startDate,
                    endDate: editingEnd || undefined,
                  })
                }
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                disabled={updateCycle.isPending}
              >
                {updateCycle.isPending ? "Saving..." : "Save end date"}
              </Button>
            </>
          ) : (
            <Text style={[styles.helper, { color: colors.muted }]}>
              No open period right now. Log a start date to begin tracking.
            </Text>
          )}
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title title="Edit or delete cycles" />
        <Card.Content>
          {cyclesQuery.data?.length ? (
            cyclesQuery.data.map((cycle) => (
              <View key={cycle.id} style={styles.cycleItem}>
                {editingId === cycle.id ? (
                  <>
                    <TextInput
                      label="Start date"
                      value={editingStart}
                      onChangeText={setEditingStart}
                      style={styles.input}
                    />
                    <TextInput
                      label="End date (optional)"
                      value={editingEnd}
                      onChangeText={setEditingEnd}
                      style={styles.input}
                    />
                    <View style={styles.rowButtons}>
                      <Button
                        mode="contained"
                        onPress={() =>
                          updateCycle.mutate({
                            id: cycle.id,
                            startDate: editingStart,
                            endDate: editingEnd || undefined,
                          })
                        }
                        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                      >
                        Save
                      </Button>
                      <Button mode="outlined" onPress={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={[styles.helper, { color: colors.muted }]}>
                      Start: {new Date(cycle.startDate).toDateString()}
                    </Text>
                    <Text style={[styles.helper, { color: colors.muted }]}>
                      End: {cycle.endDate ? new Date(cycle.endDate).toDateString() : "Not set"}
                    </Text>
                    <View style={styles.rowButtons}>
                      <Button
                        mode="outlined"
                        onPress={() => {
                          setEditingId(cycle.id);
                          setEditingStart(cycle.startDate.slice(0, 10));
                          setEditingEnd(cycle.endDate ? cycle.endDate.slice(0, 10) : "");
                        }}
                      >
                        Edit
                      </Button>
                      <Button mode="outlined" onPress={() => deleteCycle.mutate(cycle.id)}>
                        Delete
                      </Button>
                    </View>
                  </>
                )}
              </View>
            ))
          ) : (
            <Text style={[styles.helper, { color: colors.muted }]}>No cycles logged yet.</Text>
          )}
        </Card.Content>
      </Card>
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title title="What this means" />
        <Card.Content>
          <Text style={[styles.helper, { color: colors.muted }]}>
            Mark period days and symptoms to improve predictions. Your fertility window will appear after a few cycles.
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
  helper: {
    marginTop: 6,
  },
  card: {
    marginTop: 16,
  },
  input: {
    marginBottom: 8,
  },
  primaryButton: {
    marginTop: 6,
  },
  errorText: {
    color: "#d94f70",
    marginTop: 8,
  },
  endPrompt: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    borderColor: "#f0d6df",
  },
  cycleItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0d6df",
    paddingBottom: 12,
    marginBottom: 12,
  },
  rowButtons: {
    flexDirection: "row",
    gap: 8,
  },
});
