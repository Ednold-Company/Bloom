"use client";

import { ReactNode } from "react";
import Card from "@/components/ui/Card";
import api from "@/lib/api";
import { useAuthToken } from "@/lib/useAuthToken";
import { useQuery } from "@tanstack/react-query";
import { BLOOM_STICKERS } from "@/lib/stickers";

function toDate(value: string) {
  return new Date(value);
}

function formatDate(value?: Date | null) {
  if (!value) return "—";
  return value.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export default function InsightsPage() {
  const token = useAuthToken();
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
      return response.data.symptoms as Array<{ id: string; mood?: string | null; cramps?: number; energy?: number }>;
    },
    enabled: !!token,
  });

  const cycles = cyclesQuery.data ?? [];
  const sorted = [...cycles].sort(
    (a, b) => toDate(a.startDate).getTime() - toDate(b.startDate).getTime()
  );
  const lengths = sorted
    .slice(1)
    .map((cycle, index) => daysBetween(toDate(sorted[index].startDate), toDate(cycle.startDate)))
    .filter((value) => value > 0 && value < 60);

  const maxLength = lengths.length ? Math.max(...lengths) : 35;
  const averageLength = lengths.length
    ? Math.round(lengths.reduce((sum, value) => sum + value, 0) / lengths.length)
    : 28;
  const lastStart = sorted.length ? toDate(sorted[sorted.length - 1].startDate) : new Date();
  const nextStart = new Date(lastStart.getTime() + averageLength * 24 * 60 * 60 * 1000);
  const ovulation = new Date(nextStart.getTime() - 14 * 24 * 60 * 60 * 1000);
  const fertileStart = new Date(ovulation.getTime() - 5 * 24 * 60 * 60 * 1000);
  const fertileEnd = new Date(ovulation.getTime() + 1 * 24 * 60 * 60 * 1000);
  const ovulationDay = Math.max(10, averageLength - 14);
  const fertileStartDay = Math.max(5, ovulationDay - 5);
  const fertileEndDay = ovulationDay + 1;

  const periodLengths = sorted
    .filter((cycle) => cycle.endDate)
    .map((cycle) => daysBetween(toDate(cycle.startDate), toDate(cycle.endDate as string)) + 1)
    .filter((value) => value > 0 && value < 20);
  const averagePeriodLength = periodLengths.length
    ? Math.round(periodLengths.reduce((sum, value) => sum + value, 0) / periodLengths.length)
    : 5;

  const moodCounts = (symptomsQuery.data ?? []).reduce<Record<string, number>>((acc, item) => {
    if (!item.mood) return acc;
    acc[item.mood] = (acc[item.mood] || 0) + 1;
    return acc;
  }, {});
  const moodEntries = Object.entries(moodCounts);
  const moodTotal = moodEntries.reduce((sum, [, count]) => sum + count, 0);

  const topMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([mood]) => mood);

  return (
    <div className="relative grid gap-6 pb-12">
      {/* Decorative Blur Orbs */}
      <div className="pointer-events-none absolute -top-6 right-8 hidden h-56 w-56 rounded-full bg-[#ffb8cb] opacity-30 blur-3xl lg:block" />
      <div className="pointer-events-none absolute left-4 top-24 hidden h-28 w-28 rounded-full bg-[#daf5ea] opacity-40 blur-2xl lg:block" />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card
          title={
            <span className="flex items-center gap-2">
              <span className="text-xl">📊</span> Cycle Statistics
            </span>
          }
          subtitle="Your body's historical averages"
        >
          <div className="grid gap-4 text-sm pt-1">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--accent) 8%, var(--card))" }}>
                <p className="text-[11px] uppercase tracking-wider font-bold" style={{ color: "var(--accent)" }}>Average Cycle</p>
                <p className="mt-1 text-2xl font-black font-display" style={{ color: "var(--foreground)" }}>
                  {averageLength} days
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Regular & healthy window</p>
              </div>
              <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--lavender-deep) 8%, var(--card))" }}>
                <p className="text-[11px] uppercase tracking-wider font-bold text-purple-600 dark:text-purple-400">Average Period</p>
                <p className="mt-1 text-2xl font-black font-display" style={{ color: "var(--foreground)" }}>
                  {averagePeriodLength} days
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Duration of active flow</p>
              </div>
            </div>

            <div className="rounded-2xl border p-4 flex items-center justify-between" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold" style={{ color: "var(--muted)" }}>Next Predicted Period</p>
                <p className="mt-1 text-base font-bold text-[#ff5277]">{formatDate(nextStart)}</p>
              </div>
              <span className="rounded-full bg-pink-100 dark:bg-pink-950/60 px-3 py-1 text-xs font-bold text-pink-700 dark:text-pink-300">
                AI Predicted
              </span>
            </div>
          </div>
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2">
              <span className="text-xl">🌸</span> Fertility & Safe Sex Insights
            </span>
          }
          subtitle="Understanding your body's natural rhythm"
        >
          <div className="space-y-3 pt-1 text-xs md:text-sm">
            <div className="rounded-2xl border p-3.5 space-y-1" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--gold-deep) 8%, var(--card))" }}>
              <span className="font-bold text-amber-600 dark:text-amber-400">🌺 Ovulation Peak: </span>
              <span className="font-semibold" style={{ color: "var(--foreground)" }}>Day {ovulationDay} (~{formatDate(ovulation)})</span>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Luteinizing Hormone (LH) surge triggers mature egg release.</p>
            </div>

            <div className="rounded-2xl border p-3.5 space-y-1" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--accent) 8%, var(--card))" }}>
              <span className="font-bold text-[#ff5277]">🌸 Fertile Window: </span>
              <span className="font-semibold" style={{ color: "var(--foreground)" }}>Day {fertileStartDay} – {fertileEndDay}</span>
              <p className="text-xs" style={{ color: "var(--muted)" }}>High chance of conception if having unprotected sex.</p>
            </div>

            <div className="rounded-2xl border p-3.5 space-y-1" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--mint-deep) 8%, var(--card))" }}>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">🛡️ Safe Days Window: </span>
              <span className="font-semibold" style={{ color: "var(--foreground)" }}>Day {fertileEndDay + 1} until next period</span>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Post-ovulation luteal phase has the lowest pregnancy risk.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Cycle Length History Bar Chart */}
      <Card
        title={
          <span className="flex items-center gap-2">
            <span className="text-xl">📈</span> Cycle Length History
          </span>
        }
        subtitle="Comparing cycle lengths across recorded periods"
      >
        {lengths.length >= 1 ? (
          <div className="space-y-4 pt-2">
            {lengths.map((length, index) => (
              <div key={`${length}-${index}`} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                  <span>Cycle #{index + 1}</span>
                  <span className="text-[#ff5277] font-bold">{length} days</span>
                </div>
                <div className="h-3.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, var(--card))" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700 shadow-xs"
                    style={{
                      width: `${Math.min(100, (length / maxLength) * 100)}%`,
                      backgroundColor: "var(--accent)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-6 text-center text-xs" style={{ color: "var(--muted)" }}>
            <span className="text-2xl block mb-2">🌸</span>
            Log at least two period start dates in the Calendar to generate your personal cycle comparison graph.
          </div>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Mood Distribution */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <span className="text-xl">💖</span> Top Moods & Vibes
            </span>
          }
          subtitle="How you've been feeling across your cycles"
        >
          {topMoods.length ? (
            <div className="flex flex-wrap gap-2.5 pt-2">
              {topMoods.map((mood) => {
                const sticker = BLOOM_STICKERS.find(
                  (s) => s.label.toLowerCase() === mood.toLowerCase()
                );
                return (
                  <span
                    key={mood}
                    className="inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-bold"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--accent) 10%, var(--card))",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    <span>{sticker?.emoji || "✨"}</span>
                    <span>{mood}</span>
                    <span className="ml-1 text-[10px] opacity-70">
                      ({moodCounts[mood]}x)
                    </span>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-xs pt-2" style={{ color: "var(--muted)" }}>
              Log symptoms in the Journal to see your mood and energy patterns.
            </p>
          )}
        </Card>

        {/* Phase Nutrition Guide */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <span className="text-xl">🥑</span> Phase Nutrition & Seed Cycling
            </span>
          }
          subtitle="Superfoods for your hormonal balance"
        >
          <ul className="space-y-2.5 pt-2 text-xs md:text-sm" style={{ color: "var(--foreground)" }}>
            <li className="flex items-start gap-2">
              <span>🌱</span>
              <div>
                <strong>Follicular / Pre-Ovulation:</strong> Pumpkin & flax seeds, wild berries, sprouts, citrus.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span>🌺</span>
              <div>
                <strong>Ovulation Peak:</strong> Leafy greens, quinoa, wild salmon, and abundant electrolytes.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span>🍂</span>
              <div>
                <strong>Luteal / Safe Window:</strong> Sunflower & sesame seeds, roasted sweet potatoes, magnesium rich foods.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span>🩸</span>
              <div>
                <strong>Menstrual Phase:</strong> Iron-rich lentils, warming bone broths, ginger tea, dark chocolate.
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
