import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";
import api from "../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Cycle = { id: string; startDate: string };

function buildPrediction(cycles: Cycle[]) {
  if (cycles.length < 2) return null;
  const sorted = [...cycles].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  const lengths: number[] = [];
  for (let i = 1; i < sorted.length; i += 1) {
    lengths.push(
      Math.round(
        (new Date(sorted[i].startDate).getTime() - new Date(sorted[i - 1].startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
  }
  const averageCycleLength = Math.round(lengths.reduce((sum, value) => sum + value, 0) / lengths.length);
  const lastStart = new Date(sorted[sorted.length - 1].startDate);
  const nextPeriodStart = new Date(lastStart.getTime() + averageCycleLength * 24 * 60 * 60 * 1000);
  const ovulationDate = new Date(nextPeriodStart.getTime() - 14 * 24 * 60 * 60 * 1000);
  const pmsStart = new Date(nextPeriodStart.getTime() - 5 * 24 * 60 * 60 * 1000);
  return { nextPeriodStart, ovulationDate, pmsStart, averageCycleLength };
}

export default function DashboardScreen({ navigation }: any) {
  const { token, logout } = useAuth();
  const { colors } = useThemeMode();
  const queryClient = useQueryClient();
  const [showGuideTip, setShowGuideTip] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("bloom_seen_guide_tip").then((seen) => {
      if (!seen) setShowGuideTip(true);
    });
  }, []);

  const predictionsQuery = useQuery({
    queryKey: ["predictions", token],
    queryFn: async () => {
      const response = await api.get("/predictions/next", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!token,
  });

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

  const cyclePrediction = predictionsQuery.data?.cyclePrediction as
    | {
        nextPeriodStart: string;
        ovulationDate: string;
        pmsStart: string;
        averageCycleLength: number;
      }
    | null
    | undefined;

  const fallbackPrediction = cyclesQuery.data ? buildPrediction(cyclesQuery.data) : null;
  const effectivePrediction = cyclePrediction
    ? {
        nextPeriodStart: new Date(cyclePrediction.nextPeriodStart),
        ovulationDate: new Date(cyclePrediction.ovulationDate),
        pmsStart: new Date(cyclePrediction.pmsStart),
        averageCycleLength: cyclePrediction.averageCycleLength,
      }
    : fallbackPrediction;

  const symptomsQuery = useQuery({
    queryKey: ["symptoms", token],
    queryFn: async () => {
      const response = await api.get("/symptoms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.symptoms as Array<{ id: string }>;
    },
    enabled: !!token,
  });

  const showInsights = (cyclesQuery.data?.length ?? 0) >= 2;
  const hasAnySymptoms = (symptomsQuery.data?.length ?? 0) > 0;

  const ovulationWindow = effectivePrediction
    ? {
        start: new Date(effectivePrediction.ovulationDate.getTime() - 5 * 24 * 60 * 60 * 1000),
        end: new Date(effectivePrediction.ovulationDate),
      }
    : null;

  const today = new Date().toISOString().slice(0, 10);
  const quickLog = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Missing auth token");
      await api.post(
        "/cycles",
        { startDate: today },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.stickerGlowOne} />
      <View style={styles.stickerGlowTwo} />
      {showGuideTip ? (
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title title="New here? Start with the Guide" />
          <Card.Content>
            <Text style={[styles.cardText, { color: colors.muted }]}>
              Visit Bloom Guide for a quick tour on logging cycles, symptoms, and predictions.
            </Text>
            <Button
              mode="contained"
              onPress={async () => {
                await AsyncStorage.setItem("bloom_seen_guide_tip", "true");
                setShowGuideTip(false);
                navigation.navigate("Chat");
              }}
              style={styles.primaryButton}
            >
              Go to Bloom Guide
            </Button>
          </Card.Content>
        </Card>
      ) : null}
      <Text style={[styles.title, { color: colors.text }]}>Bloom Dashboard</Text>
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title title="Next cycle forecast" />
        <Card.Content>
          <Text style={[styles.cardText, { color: colors.muted }]}>
            {effectivePrediction
              ? `Next period: ${effectivePrediction.nextPeriodStart.toDateString()}`
              : "Not enough data yet. Log at least two cycles to see predictions."}
          </Text>
          <Text style={[styles.cardText, { color: colors.muted }]}>
            Ovulation window: {ovulationWindow ? `${ovulationWindow.start.toDateString()} ? ${ovulationWindow.end.toDateString()}` : "-"}
          </Text>
          <Text style={[styles.cardText, { color: colors.muted }]}>
            PMS starts: {effectivePrediction ? effectivePrediction.pmsStart.toDateString() : "-"}
          </Text>
        </Card.Content>
      </Card>
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title title="How Bloom learns" />
        <Card.Content>
          <Text style={[styles.cardText, { color: colors.muted }]}>
            Bloom looks at your past cycle lengths and symptom patterns. The more you log, the better the predictions.
          </Text>
        </Card.Content>
      </Card>
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title title="Quick log" />
        <Card.Content>
          <Button
            mode="contained"
            onPress={() => quickLog.mutate()}
            disabled={!token || quickLog.isPending || !hasAnySymptoms}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          >
            {quickLog.isPending ? "Logging..." : "Log period start (today)"}
          </Button>
          {!hasAnySymptoms ? (
            <Text style={[styles.cardText, { color: colors.muted }]}>
              Log at least one symptom before starting a period entry.
            </Text>
          ) : null}
          <Button mode="outlined" onPress={() => navigation.navigate("Symptoms")} style={styles.secondaryButton}>
            Log symptoms
          </Button>
        </Card.Content>
      </Card>
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title title="Notifications" />
        <Card.Content>
          <Text style={[styles.cardText, { color: colors.muted }]}>
            Get gentle reminders for period start, fertility window, and wellness check-ins.
          </Text>
        </Card.Content>
      </Card>
      <View style={styles.buttonRow}>
        <Button mode="contained" onPress={() => navigation.navigate("Calendar")}>
          Calendar
        </Button>
        <Button mode="outlined" onPress={() => navigation.navigate("Symptoms")}>
          Symptoms
        </Button>
        <Button mode="outlined" onPress={() => navigation.navigate("Chat")}>
          Bloom Guide
        </Button>
        {showInsights ? (
          <Button mode="outlined" onPress={() => navigation.navigate("Insights")}>
            Insights
          </Button>
        ) : null}
      </View>
      <Button onPress={logout} textColor={colors.primary}>
        Sign out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  stickerGlowOne: {
    position: "absolute",
    right: 10,
    top: 12,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: "#f1e6ff",
    opacity: 0.45,
  },
  stickerGlowTwo: {
    position: "absolute",
    left: 12,
    top: 140,
    width: 90,
    height: 90,
    borderRadius: 999,
    backgroundColor: "#ffd4c1",
    opacity: 0.55,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardText: {
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  primaryButton: {
    marginTop: 8,
  },
  secondaryButton: {
    marginTop: 8,
  },
});
