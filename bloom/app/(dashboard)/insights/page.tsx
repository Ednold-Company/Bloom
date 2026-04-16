"use client";

import Card from "@/components/ui/Card";
import api from "@/lib/api";
import { useAuthToken } from "@/lib/useAuthToken";
import { useQuery } from "@tanstack/react-query";

function toDate(value: string) {
  return new Date(value);
}

function formatDate(value?: Date | null) {
  if (!value) return "—";
  return value.toDateString();
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
      return response.data.symptoms as Array<{ id: string; mood?: string | null }>;
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

  const maxLength = lengths.length ? Math.max(...lengths) : 0;
  const averageLength = lengths.length
    ? Math.round(lengths.reduce((sum, value) => sum + value, 0) / lengths.length)
    : undefined;
  const lastStart = sorted.length ? toDate(sorted[sorted.length - 1].startDate) : undefined;
  const nextStart =
    lastStart && averageLength
      ? new Date(lastStart.getTime() + averageLength * 24 * 60 * 60 * 1000)
      : undefined;
  const ovulation =
    nextStart && averageLength ? new Date(nextStart.getTime() - 14 * 24 * 60 * 60 * 1000) : undefined;
  const fertileStart =
    ovulation && averageLength ? new Date(ovulation.getTime() - 5 * 24 * 60 * 60 * 1000) : undefined;
  const fertileEnd = ovulation ?? undefined;
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
    .map((cycle) => daysBetween(toDate(cycle.startDate), toDate(cycle.endDate as string)) + 1)
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
    <div className="relative grid gap-6">
      <div className="pointer-events-none absolute -top-6 right-8 hidden h-56 w-56 rounded-full bg-[#ffd4c1] opacity-40 blur-3xl lg:block" />
      <div className="pointer-events-none absolute left-4 top-24 hidden h-28 w-28 rounded-full bg-[#d9f3ea] opacity-60 blur-2xl lg:block" />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card title="Cycle snapshot">
          <div className="grid gap-4 text-sm text-[#5a2d4b]/80">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#f0d6df] bg-[#fff6f8] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#5a2d4b]/60">Average cycle</p>
                <p className="mt-2 text-2xl font-semibold text-[#5a2d4b]">
                  {averageLength ? `${averageLength} days` : "Add 2 cycles"}
                </p>
              </div>
              <div className="rounded-2xl border border-[#f0d6df] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#5a2d4b]/60">Average period</p>
                <p className="mt-2 text-2xl font-semibold text-[#5a2d4b]">
                  {averagePeriodLength ? `${averagePeriodLength} days` : "Log end dates"}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#f0d6df] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#5a2d4b]/60">Next predicted start</p>
              <p className="mt-2 text-lg font-semibold text-[#5a2d4b]">{formatDate(nextStart)}</p>
              <p className="mt-1 text-xs text-[#5a2d4b]/60">
                Predictions improve with more cycles.
              </p>
            </div>
          </div>
        </Card>
        <Card title="Bloom companion">
          <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr] items-center">
            <div className="grid gap-3 text-sm text-[#5a2d4b]/70">
              <p>
                Your body is doing incredible work. Bloom keeps refining your predictions as you log
                more data.
              </p>
              <div className="rounded-2xl border border-[#f0d6df] bg-[#fff6f8] p-3 text-xs text-[#5a2d4b]/70">
                {averageLength && ovulation
                  ? `Estimated ovulation: ${formatDate(ovulation)}`
                  : "Log at least two cycles to unlock ovulation estimates."}
              </div>
            </div>
            <div className="relative h-44 w-full">
              <div className="sticker sticker-1" />
              <div className="sticker sticker-2" />
              <div className="sticker sticker-3" />
              <div className="absolute inset-x-8 bottom-3 h-16 rounded-full bg-white/70 backdrop-blur-sm" />
              <div className="absolute right-8 top-6 h-12 w-12 rounded-full bg-[#ffd4c1] opacity-80 blur-md" />
            </div>
          </div>
        </Card>
      </div>

      <Card title="Your cycle chart">
        {lengths.length >= 1 ? (
          <div className="grid gap-3">
            {lengths.map((length, index) => (
              <div key={`${length}-${index}`} className="grid gap-2">
                <div className="flex items-center justify-between text-xs text-[#5a2d4b]/70">
                  <span>Cycle {index + 1} length</span>
                  <span>{length} days</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#fdf1f4]">
                  <div
                    className="h-3 rounded-full bg-[#ef7a9a] transition-all duration-700"
                    style={{ width: `${(length / maxLength) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-[#5a2d4b]/60">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ef7a9a]" />
                Cycle length
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#5a2d4b]/70">Log at least two cycles to see a chart.</p>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Mood pie">
          {moodTotal ? (
            <div className="grid gap-4 sm:grid-cols-[140px_1fr] items-center">
              <svg viewBox="0 0 120 120" className="h-36 w-36">
                <circle cx="60" cy="60" r="48" fill="none" stroke="#f4dde5" strokeWidth="16" />
                {moodEntries.reduce<{ offset: number; segments: JSX.Element[] }>(
                  (acc, [mood, count], index) => {
                    const portion = count / moodTotal;
                    const dashArray = `${portion * 302} ${302}`;
                    const strokeDashoffset = acc.offset;
                    const colors = ["#ef7a9a", "#f2a3b5", "#d9f3ea", "#f1e6ff", "#ffd4c1"];
                    acc.segments.push(
                      <circle
                        key={mood}
                        cx="60"
                        cy="60"
                        r="48"
                        fill="none"
                        stroke={colors[index % colors.length]}
                        strokeWidth="16"
                        strokeDasharray={dashArray}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 60 60)"
                      />
                    );
                    acc.offset -= portion * 302;
                    return acc;
                  },
                  { offset: 0, segments: [] }
                ).segments}
                <circle cx="60" cy="60" r="30" fill="#fff" />
                <text x="60" y="64" textAnchor="middle" fontSize="12" fill="#5a2d4b">
                  Moods
                </text>
              </svg>
              <div className="grid gap-2 text-sm text-[#5a2d4b]/70">
                {moodEntries.map(([mood, count]) => (
                  <div key={mood} className="flex items-center justify-between">
                    <span className="capitalize">{mood}</span>
                    <span>{Math.round((count / moodTotal) * 100)}%</span>
                  </div>
                ))}
                <div className="mt-2 grid gap-1 text-xs text-[#5a2d4b]/60">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#ef7a9a]" />
                    Most frequent moods
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#f2a3b5]" />
                    Other moods
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#5a2d4b]/70">Log symptoms to see mood distribution.</p>
          )}
        </Card>
        <Card title="Ovulation & fertility window">
          {averageLength && fertileStartDay && fertileEndDay ? (
            <div className="grid gap-4 text-sm text-[#5a2d4b]/70">
              <div className="rounded-2xl border border-[#f0d6df] bg-white p-4">
                <div className="flex items-center justify-between text-xs text-[#5a2d4b]/60">
                  <span>Cycle days</span>
                  <span>{averageLength} days</span>
                </div>
                <div className="relative mt-3 h-4 rounded-full bg-[#fdf1f4]">
                  <div
                    className="absolute h-4 rounded-full bg-[#ffd4c1]"
                    style={{ left: 0, width: `${Math.max(0, fertileStartPct - 2)}%` }}
                  />
                  <div
                    className="absolute h-4 rounded-full bg-[#ef7a9a]"
                    style={{ left: `${fertileStartPct}%`, width: `${fertileWidthPct}%` }}
                  />
                  <div
                    className="absolute h-4 rounded-full bg-[#d9f3ea]"
                    style={{
                      left: `${fertileStartPct + fertileWidthPct}%`,
                      width: `${Math.max(0, 100 - fertileStartPct - fertileWidthPct)}%`,
                    }}
                  />
                </div>
                <div className="mt-3 grid gap-1 text-xs text-[#5a2d4b]/60">
                  <p>
                    Fertile window: day {fertileStartDay} to {fertileEndDay}
                  </p>
                  <p>Estimated ovulation: day {ovulationDay}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-[#5a2d4b]/60">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#ffd4c1]" />
                      Lower chance days
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#ef7a9a]" />
                      Fertile window
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#d9f3ea]" />
                      After ovulation
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-[#f0d6df] bg-[#fff6f8] p-4 text-xs text-[#5a2d4b]/70">
                Lower chance days are outside the fertile window. This is not a contraceptive method
                and pregnancy can still occur.
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#5a2d4b]/70">
              Log at least two cycles to estimate ovulation and fertile windows.
            </p>
          )}
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Mood highlights">
          {topMoods.length ? (
            <div className="flex flex-wrap gap-2">
              {topMoods.map((mood) => (
                <span
                  key={mood}
                  className="rounded-full bg-[#fdf1f4] px-4 py-2 text-sm font-semibold text-[#5a2d4b]"
                >
                  {mood}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#5a2d4b]/70">Log symptoms to see mood trends.</p>
          )}
        </Card>
        <Card title="Suggested foods">
          <ul className="grid gap-2 text-sm text-[#5a2d4b]/70">
            {foodSuggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
