import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Text } from "react-native-paper";
import Svg, { Circle } from "react-native-svg";
import { useThemeMode } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useQuery } from "@tanstack/react-query";

function formatDate(value?: Date | null) {
  if (!value) return "-";
  return value.toDateString();
}

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export default function InsightsScreen() {
  const { token } = useAuth();
  const { colors } = useThemeMode();

  const cyclesQuery = useQuery({
    queryKey: ["cycles", token],
    queryFn: async () => {
      const response = await api.get("/cycles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.cycles as Array<{ id: string; startDate: string; endDate?: string | null }>;
    },
    enabled: !!token,
  });

  const symptomsQuery = useQuery({
    queryKey: ["symptoms", token],
    queryFn: async () => {
      const response = await api.get("/symptoms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.symptoms as Array<{ id: string; mood?: string | null }>;
    },
    enabled: !!token,
  });

  const cycles = cyclesQuery.data ?? [];
  const sorted = [...cycles].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  const lengths = sorted
    .slice(1)
    .map((cycle, index) => daysBetween(new Date(sorted[index].startDate), new Date(cycle.startDate)))
    .filter((value) => value > 0 && value < 60);

  const maxLength = lengths.length ? Math.max(...lengths) : 0;
  const averageLength = lengths.length
    ? Math.round(lengths.reduce((sum, value) => sum + value, 0) / lengths.length)
    : undefined;
  const lastStart = sorted.length ? new Date(sorted[sorted.length - 1].startDate) : undefined;
  const nextStart =
    lastStart && averageLength
      ? new Date(lastStart.getTime() + averageLength * 24 * 60 * 60 * 1000)
      : undefined;
  const ovulation =
    nextStart && averageLength ? new Date(nextStart.getTime() - 14 * 24 * 60 * 60 * 1000) : undefined;
  const ovulationDay = averageLength ? Math.max(1, averageLength - 14) : undefined;
  const fertileStartDay = ovulationDay ? Math.max(1, ovulationDay - 5) : undefined;
  const fertileEndDay = ovulationDay ?? undefined;
  const fertileStartPct =
    averageLength && fertileStartDay ? Math.min(100, (fertileStartDay / averageLength) * 100) : 0;
  const fertileWidthPct =
    averageLength && fertileStartDay && fertileEndDay
      ? Math.min(100, ((fertileEndDay - fertileStartDay + 1) / averageLength) * 100)
      : 0;

  const periodLengths = sorted
    .filter((cycle) => cycle.endDate)
    .map((cycle) => daysBetween(new Date(cycle.startDate), new Date(cycle.endDate as string)) + 1)
    .filter((value) => value > 0 && value < 20);
  const averagePeriodLength = periodLengths.length
    ? Math.round(periodLengths.reduce((sum, value) => sum + value, 0) / periodLengths.length)
    : undefined;

  const moodCounts = (symptomsQuery.data ?? []).reduce<Record<string, number>>((acc, item) => {
    if (!item.mood) return acc;
    acc[item.mood] = (acc[item.mood] || 0) + 1;
    return acc;
  }, {});
  const moodEntries = Object.entries(moodCounts);
  const moodTotal = moodEntries.reduce((sum, [, count]) => sum + count, 0);

  const topMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([mood]) => mood);

  const foodSuggestions = [
    "Warm soups with leafy greens",
    "Dark chocolate + berries",
    "Ginger tea or lemon water",
    "Omega-3 rich meals (salmon, chia)",
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.stickerGlowOne} />
      <View style={styles.stickerGlowTwo} />
      <Text style={[styles.title, { color: colors.text }]}>Insights</Text>

      <View style={styles.row}>
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title title="Cycle snapshot" />
          <Card.Content>
            <View style={styles.snapshotRow}>
              <View style={styles.snapshotTile}>
                <Text style={[styles.snapshotLabel, { color: colors.muted }]}>Average cycle</Text>
                <Text style={[styles.snapshotValue, { color: colors.text }]}>
                  {averageLength ? `${averageLength} days` : "Add 2 cycles"}
                </Text>
              </View>
              <View style={styles.snapshotTile}>
                <Text style={[styles.snapshotLabel, { color: colors.muted }]}>Average period</Text>
                <Text style={[styles.snapshotValue, { color: colors.text }]}>
                  {averagePeriodLength ? `${averagePeriodLength} days` : "Log end dates"}
                </Text>
              </View>
            </View>
            <View style={styles.snapshotTileWide}>
              <Text style={[styles.snapshotLabel, { color: colors.muted }]}>Next predicted start</Text>
              <Text style={[styles.snapshotValue, { color: colors.text }]}>{formatDate(nextStart)}</Text>
              <Text style={[styles.helper, { color: colors.muted }]}>
                Predictions improve with more cycles.
              </Text>
            </View>
          </Card.Content>
        </Card>
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title title="Bloom companion" />
          <Card.Content>
            <Text style={[styles.helper, { color: colors.muted }]}>
              Your body is doing incredible work. Bloom keeps refining predictions as you log more data.
            </Text>
            <View style={styles.companionBadge}>
              <Text style={[styles.helper, { color: colors.text }]}>
                {ovulation ? `Estimated ovulation: ${formatDate(ovulation)}` : "Log at least two cycles to unlock estimates."}
              </Text>
            </View>
            <View style={styles.companionStickers}>
              <View style={styles.stickerBubbleLarge} />
              <View style={styles.stickerBubbleMid} />
              <View style={styles.stickerBubbleSmall} />
            </View>
          </Card.Content>
        </Card>
      </View>

      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Title title="Cycle chart" />
        <Card.Content>
          {lengths.length ? (
            <>
              {lengths.map((length, index) => (
                <View key={`${length}-${index}`} style={styles.chartRow}>
                  <View style={styles.chartHeader}>
                    <Text style={[styles.chartLabel, { color: colors.muted }]}>Cycle {index + 1}</Text>
                    <Text style={[styles.chartLabel, { color: colors.muted }]}>{length} days</Text>
                  </View>
                  <View style={styles.chartTrack}>
                    <View
                      style={[
                        styles.chartFill,
                        { width: `${(length / maxLength) * 100}%`, backgroundColor: colors.primary },
                      ]}
                    />
                  </View>
                </View>
              ))}
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.legendText, { color: colors.muted }]}>Cycle length</Text>
              </View>
            </>
          ) : (
            <Text style={[styles.helper, { color: colors.muted }]}>Log at least two cycles to see a chart.</Text>
          )}
        </Card.Content>
      </Card>

      <View style={styles.row}>
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title title="Mood pie" />
          <Card.Content>
            {moodTotal ? (
              <View style={styles.moodRow}>
                <Svg width={140} height={140}>
                  <Circle cx="70" cy="70" r="52" stroke="#f4dde5" strokeWidth="16" fill="none" />
                  {moodEntries.reduce<{ offset: number; nodes: React.ReactNode[] }>(
                    (acc, [mood, count], index) => {
                      const portion = count / moodTotal;
                      const circumference = 2 * Math.PI * 52;
                      const dashArray = `${portion * circumference} ${circumference}`;
                      const colorsPalette = ["#ef7a9a", "#f2a3b5", "#d9f3ea", "#f1e6ff", "#ffd4c1"];
                      acc.nodes.push(
                        <Circle
                          key={mood}
                          cx="70"
                          cy="70"
                          r="52"
                          stroke={colorsPalette[index % colorsPalette.length]}
                          strokeWidth="16"
                          strokeDasharray={dashArray}
                          strokeDashoffset={acc.offset}
                          strokeLinecap="round"
                          fill="none"
                          rotation={-90}
                          origin="70,70"
                        />
                      );
                      acc.offset -= portion * circumference;
                      return acc;
                    },
                    { offset: 0, nodes: [] }
                  ).nodes}
                  <Circle cx="70" cy="70" r="32" fill="#ffffff" />
                </Svg>
                <View style={styles.moodLegend}>
                  {moodEntries.map(([mood, count]) => (
                    <View key={mood} style={styles.legendRow}>
                      <Text style={[styles.legendText, { color: colors.text }]}>{mood}</Text>
                      <Text style={[styles.legendText, { color: colors.muted }]}>
                        {Math.round((count / moodTotal) * 100)}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={[styles.helper, { color: colors.muted }]}>Log symptoms to see mood distribution.</Text>
            )}
          </Card.Content>
        </Card>
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title title="Ovulation & fertility" />
          <Card.Content>
            {averageLength && fertileStartDay && fertileEndDay ? (
              <>
                <View style={styles.fertilityTrack}>
                  <View style={[styles.fertilityLow, { width: `${Math.max(0, fertileStartPct - 2)}%` }]} />
                  <View style={[styles.fertilityHigh, { width: `${fertileWidthPct}%` }]} />
                  <View
                    style={[
                      styles.fertilityPost,
                      { width: `${Math.max(0, 100 - fertileStartPct - fertileWidthPct)}%` },
                    ]}
                  />
                </View>
                <Text style={[styles.helper, { color: colors.muted }]}>
                  Fertile window: day {fertileStartDay} to {fertileEndDay}
                </Text>
                <Text style={[styles.helper, { color: colors.muted }]}>
                  Estimated ovulation: day {ovulationDay}
                </Text>
                <View style={styles.legendStack}>
                  <View style={styles.legendRow}>
                    <View style={[styles.legendDot, styles.legendDotLow]} />
                    <Text style={[styles.legendText, { color: colors.muted }]}>Lower chance days</Text>
                  </View>
                  <View style={styles.legendRow}>
                    <View style={[styles.legendDot, styles.legendDotHigh]} />
                    <Text style={[styles.legendText, { color: colors.muted }]}>Fertile window</Text>
                  </View>
                  <View style={styles.legendRow}>
                    <View style={[styles.legendDot, styles.legendDotPost]} />
                    <Text style={[styles.legendText, { color: colors.muted }]}>After ovulation</Text>
                  </View>
                </View>
                <View style={styles.disclaimer}>
                  <Text style={[styles.helper, { color: colors.muted }]}>
                    Lower chance days are outside the fertile window. This is not contraception.
                  </Text>
                </View>
              </>
            ) : (
              <Text style={[styles.helper, { color: colors.muted }]}>
                Log at least two cycles to estimate ovulation and fertility windows.
              </Text>
            )}
          </Card.Content>
        </Card>
      </View>

      <View style={styles.row}>
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title title="Mood highlights" />
          <Card.Content>
            {topMoods.length ? (
              <View style={styles.tags}>
                {topMoods.map((mood) => (
                  <View key={mood} style={styles.tag}>
                    <Text style={[styles.tagText, { color: colors.text }]}>{mood}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.helper, { color: colors.muted }]}>Log symptoms to see mood trends.</Text>
            )}
          </Card.Content>
        </Card>
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title title="Suggested foods" />
          <Card.Content>
            {foodSuggestions.map((item) => (
              <Text key={item} style={[styles.helper, { color: colors.muted }]}>
                - {item}
              </Text>
            ))}
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    marginBottom: 16,
  },
  helper: {
    marginTop: 4,
  },
  stickerGlowOne: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "#ffd4c1",
    opacity: 0.35,
  },
  stickerGlowTwo: {
    position: "absolute",
    left: 10,
    top: 120,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "#d9f3ea",
    opacity: 0.5,
  },
  snapshotRow: {
    flexDirection: "row",
    gap: 12,
  },
  snapshotTile: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f0d6df",
    backgroundColor: "#fff6f8",
  },
  snapshotTileWide: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f0d6df",
    backgroundColor: "#ffffff",
  },
  snapshotLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  snapshotValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "600",
  },
  chartRow: {
    marginBottom: 12,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  chartLabel: {
    fontSize: 12,
  },
  chartTrack: {
    height: 10,
    backgroundColor: "#fdf1f4",
    borderRadius: 999,
    overflow: "hidden",
  },
  chartFill: {
    height: 10,
    borderRadius: 999,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  legendStack: {
    marginTop: 8,
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  legendDotLow: {
    backgroundColor: "#ffd4c1",
  },
  legendDotHigh: {
    backgroundColor: "#ef7a9a",
  },
  legendDotPost: {
    backgroundColor: "#d9f3ea",
  },
  legendText: {
    fontSize: 12,
  },
  row: {
    gap: 12,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#fdf1f4",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  moodRow: {
    gap: 16,
    alignItems: "center",
  },
  moodLegend: {
    width: "100%",
    gap: 6,
  },
  fertilityTrack: {
    flexDirection: "row",
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#fdf1f4",
    marginBottom: 8,
  },
  fertilityLow: {
    backgroundColor: "#ffd4c1",
  },
  fertilityHigh: {
    backgroundColor: "#ef7a9a",
  },
  fertilityPost: {
    backgroundColor: "#d9f3ea",
  },
  disclaimer: {
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0d6df",
    backgroundColor: "#fff6f8",
  },
  companionBadge: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0d6df",
    backgroundColor: "#fff6f8",
  },
  companionStickers: {
    marginTop: 12,
    height: 90,
  },
  stickerBubbleLarge: {
    position: "absolute",
    right: 10,
    top: 4,
    width: 70,
    height: 70,
    borderRadius: 999,
    backgroundColor: "#ef7a9a",
    opacity: 0.45,
  },
  stickerBubbleMid: {
    position: "absolute",
    left: 12,
    bottom: 6,
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#d9f3ea",
    opacity: 0.6,
  },
  stickerBubbleSmall: {
    position: "absolute",
    left: 80,
    top: 30,
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#f1e6ff",
    opacity: 0.7,
  },
});
