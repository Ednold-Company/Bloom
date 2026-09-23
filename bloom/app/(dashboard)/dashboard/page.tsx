"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import api from "@/lib/api";
import { useAuthToken } from "@/lib/useAuthToken";
import { BLOOM_STICKERS, StickerItem } from "@/lib/stickers";
import StickerBadge from "@/components/ui/StickerBadge";
import Link from "next/link";
import { predictCycle, PredictionResult } from "@/lib/predictor";
import CycleTimelineChart from "@/components/dashboard/CycleTimelineChart";
import FertilityPieChart from "@/components/dashboard/FertilityPieChart";
import PwaInstallBanner from "@/components/pwa/PwaInstallBanner";

type Cycle = { id: string; startDate: string; endDate?: string };
type Symptom = { id: string; date: string; mood?: string; cramps?: number; sleep?: number; energy?: number; notes?: string };

export default function DashboardPage() {
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const cyclesQuery = useQuery({
    queryKey: ["cycles", token],
    queryFn: async () => {
      const response = await api.get("/cycles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return (response.data.cycles || []) as Cycle[];
    },
    enabled: !!token,
  });

  const symptomsQuery = useQuery({
    queryKey: ["symptoms", token],
    queryFn: async () => {
      const response = await api.get("/symptoms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return (response.data.symptoms || []) as Symptom[];
    },
    enabled: !!token,
  });

  const rawCycles = cyclesQuery.data || [];
  const rawSymptoms = symptomsQuery.data || [];

  // Compute prediction dynamically
  const prediction: PredictionResult = predictCycle(rawCycles as any);

  const todayIso = new Date().toISOString().slice(0, 10);

  // Quick Period Log Mutation
  const quickLogPeriod = useMutation({
    mutationFn: async () => {
      await api.post(
        "/cycles",
        { startDate: todayIso },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      showToast("🌸 Period start logged for today!");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.error || "Could not log period start.");
    },
  });

  // 1-Tap Daily Sticker Check-in Mutation
  const logStickerMutation = useMutation({
    mutationFn: async (sticker: StickerItem) => {
      await api.post(
        "/symptoms",
        {
          date: todayIso,
          mood: sticker.label,
          notes: `Logged sticker: ${sticker.emoji} ${sticker.label} - ${sticker.description}`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: (_, sticker) => {
      setSelectedSticker(sticker.id);
      queryClient.invalidateQueries({ queryKey: ["symptoms"] });
      showToast(`✨ Logged ${sticker.emoji} ${sticker.label} for today!`);
    },
    onError: () => {
      showToast("Unable to save sticker log. Please check your connection.");
    },
  });

  const dateOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const nextPeriodDateStr = prediction.nextPeriodStart.toLocaleDateString("en-US", dateOpts);
  const ovulationDateStr = prediction.ovulationDate.toLocaleDateString("en-US", dateOpts);

  return (
    <div className="relative space-y-6 md:space-y-8 pb-12">
      {/* Decorative blurred background orbs */}
      <div className="pointer-events-none absolute -top-10 right-4 hidden h-64 w-64 rounded-full bg-[#ffb8cb] opacity-40 blur-3xl lg:block" />
      <div className="pointer-events-none absolute top-72 left-4 hidden h-48 w-48 rounded-full bg-[#eee4ff] opacity-50 blur-3xl lg:block" />

      {/* Floating Toast Notification */}
      {toastMessage ? (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#ff5277] px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-pink-500/25 animate-pop">
          <span>{toastMessage}</span>
        </div>
      ) : null}

      {/* PWA Home Screen Installation Banner */}
      <PwaInstallBanner />

      {/* Hero Cycle Ring & Live Status Card */}
      <div
        className="relative overflow-hidden rounded-3xl border p-5 md:p-8 shadow-xl transition-all glass-card"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)", color: "var(--accent)" }}
              >
                🌸 {prediction.currentPhaseLabel}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${prediction.conceptionBadgeClass}`}>
                {prediction.conceptionRiskLabel}
              </span>
            </div>

            <h1 className="font-display text-2xl md:text-4xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
              Day {prediction.currentCycleDay} of Cycle
            </h1>

            <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--muted)" }}>
              Next period expected in{" "}
              <strong className="font-extrabold text-[#ff5277]">
                {prediction.daysUntilNextPeriod} {prediction.daysUntilNextPeriod === 1 ? "day" : "days"}
              </strong>{" "}
              ({nextPeriodDateStr})
            </p>
          </div>

          {/* Visual Cycle Progress Gauge */}
          <div className="flex items-center gap-4 rounded-2xl p-4 md:p-5 border self-start md:self-auto" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--accent) 8%, var(--card))" }}>
            <div className="relative flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full border-4 border-[#ff6584] shadow-inner shrink-0">
              <span className="font-display text-xl md:text-2xl font-black text-[#ff5277]">
                {prediction.currentCycleDay}
              </span>
              <span className="absolute -bottom-2 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-white dark:bg-[#1a0f1e] text-[#ff5277] shadow-xs">
                Day
              </span>
            </div>
            <div className="text-xs space-y-1" style={{ color: "var(--muted)" }}>
              <p className="font-bold text-xs md:text-sm" style={{ color: "var(--foreground)" }}>
                {prediction.averageCycleLength}-day cycle
              </p>
              <p>🌸 Peak: {ovulationDateStr}</p>
              <p>🩸 Next: {nextPeriodDateStr}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 28-Day Cycle Timeline & Live Day Inspector */}
      <CycleTimelineChart prediction={prediction} />

      {/* Fertility vs Safe Sex Donut / Pie Chart */}
      <FertilityPieChart prediction={prediction} />

      {/* 3 Core Forecasting Cards: Next Period, Fertile Window, Safe Sex Window */}
      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3">
        {/* Card 1: Next Period */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <span className="text-lg md:text-xl">🩸</span> Next Period
            </span>
          }
          badge={
            <span className="rounded-full bg-rose-100 dark:bg-rose-950/60 px-2.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
              in {prediction.daysUntilNextPeriod}d
            </span>
          }
        >
          <div className="space-y-3 text-xs md:text-sm">
            <div className="flex items-baseline justify-between border-b pb-2" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--muted)" }}>Expected Start</span>
              <span className="font-bold" style={{ color: "var(--foreground)" }}>{nextPeriodDateStr}</span>
            </div>
            <div className="flex items-baseline justify-between border-b pb-2" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--muted)" }}>Avg Cycle Length</span>
              <span className="font-bold" style={{ color: "var(--foreground)" }}>{prediction.averageCycleLength} days</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span style={{ color: "var(--muted)" }}>Period Duration</span>
              <span className="font-bold" style={{ color: "var(--foreground)" }}>~5 days</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Fertile Window & Ovulation */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <span className="text-lg md:text-xl">🌺</span> Fertile & Ovulation
            </span>
          }
          badge={
            <span className="rounded-full bg-pink-100 dark:bg-pink-950/60 px-2.5 py-0.5 text-xs font-bold text-pink-600 dark:text-pink-400">
              High Chance
            </span>
          }
        >
          <div className="space-y-3 text-xs md:text-sm">
            <div className="flex items-baseline justify-between border-b pb-2" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--muted)" }}>Fertile Window</span>
              <span className="font-bold text-pink-600 dark:text-pink-400">
                {prediction.safeSexSummary.fertileWindowDates}
              </span>
            </div>
            <div className="flex items-baseline justify-between border-b pb-2" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--muted)" }}>Ovulation Peak</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {ovulationDateStr} (Day {Math.max(10, prediction.averageCycleLength - 14)})
              </span>
            </div>
            <p className="text-[11px] pt-1 leading-normal" style={{ color: "var(--muted)" }}>
              Sperm can survive 3–5 days in fertile fluid before egg release.
            </p>
          </div>
        </Card>

        {/* Card 3: Safe Sex / Sex Free Window */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <span className="text-lg md:text-xl">🛡️</span> Safe Days & Free Sex
            </span>
          }
          badge={
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${prediction.conceptionBadgeClass}`}>
              {prediction.safeSexSummary.isTodaySafe ? "🟢 Safe Days" : "🔴 Fertile"}
            </span>
          }
        >
          <div className="space-y-3 text-xs md:text-sm">
            <p className="font-bold text-xs" style={{ color: "var(--foreground)" }}>
              {prediction.safeSexSummary.headline}
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>
              {prediction.safeSexSummary.description}
            </p>
            <div className="rounded-xl p-2.5 text-xs font-semibold" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 8%, var(--card))" }}>
              <span className="font-bold text-[#ff5277]">Safe Window: </span>
              <span style={{ color: "var(--foreground)" }}>{prediction.safeSexSummary.safeWindowDates}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 1-Tap Daily Mood & Feeling Check-in */}
      <Card
        title={
          <span className="flex items-center gap-2">
            <span className="text-lg">💖</span> How Are You Feeling Today?
          </span>
        }
        subtitle="Tap to quickly log your daily mood and energy"
      >
        <div className="flex flex-wrap gap-2.5 pt-2">
          {BLOOM_STICKERS.map((sticker) => {
            const isSelected = selectedSticker === sticker.id;
            return (
              <StickerBadge
                key={sticker.id}
                sticker={sticker}
                size="sm"
                selected={isSelected}
                onClick={() => logStickerMutation.mutate(sticker)}
              />
            );
          })}
        </div>
      </Card>

      {/* Daily Hormone & Body Intelligence */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card
          title={
            <span className="flex items-center gap-2">
              <span className="text-lg md:text-xl">{prediction.phaseIntelligence.stickerEmoji}</span>
              {prediction.phaseIntelligence.title}
            </span>
          }
          subtitle="What your body and hormones are experiencing today"
        >
          <div className="grid grid-cols-2 gap-2.5 text-xs md:text-sm pt-2">
            <div className="rounded-2xl p-3 border" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--accent) 6%, var(--card))" }}>
              <p className="text-[10px] uppercase tracking-wider font-bold text-[#ff5277]">Estrogen</p>
              <p className="mt-0.5 font-bold" style={{ color: "var(--foreground)" }}>{prediction.phaseIntelligence.estrogen}</p>
            </div>
            <div className="rounded-2xl p-3 border" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--lavender-deep) 6%, var(--card))" }}>
              <p className="text-[10px] uppercase tracking-wider font-bold text-purple-600 dark:text-purple-400">Progesterone</p>
              <p className="mt-0.5 font-bold" style={{ color: "var(--foreground)" }}>{prediction.phaseIntelligence.progesterone}</p>
            </div>
            <div className="rounded-2xl p-3 border" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--mint-deep) 6%, var(--card))" }}>
              <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">Energy Vibe</p>
              <p className="mt-0.5 font-bold" style={{ color: "var(--foreground)" }}>{prediction.phaseIntelligence.energy}</p>
            </div>
            <div className="rounded-2xl p-3 border" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--gold-deep) 6%, var(--card))" }}>
              <p className="text-[10px] uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">Mood Tone</p>
              <p className="mt-0.5 font-bold" style={{ color: "var(--foreground)" }}>{prediction.phaseIntelligence.mood}</p>
            </div>
          </div>
          <div className="mt-3.5 rounded-2xl border p-3 text-xs leading-relaxed" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--accent) 5%, var(--card))" }}>
            <span className="font-bold text-[#ff5277]">🥑 Nourish Tip: </span>
            <span style={{ color: "var(--foreground)" }}>{prediction.phaseIntelligence.nutritionTip}</span>
          </div>
        </Card>

        {/* Quick Actions & AI Assistant Starters */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <span className="text-lg md:text-xl">✨</span> Quick Actions & Bloom Guide
            </span>
          }
          subtitle="Manage your cycle or ask questions"
        >
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => quickLogPeriod.mutate()}
              disabled={quickLogPeriod.isPending}
              className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white transition-all shadow-md active:scale-98 disabled:opacity-60 cursor-pointer"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <span>🩸</span>
              <span>{quickLogPeriod.isPending ? "Logging..." : "Period Started Today (Quick Log)"}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/calendar"
                className="flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-xs font-bold transition hover:scale-102 text-center"
                style={{ borderColor: "var(--border)", color: "var(--foreground)", backgroundColor: "var(--card)" }}
              >
                <span>📅</span> Calendar View
              </Link>
              <Link
                href="/symptoms"
                className="flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-xs font-bold transition hover:scale-102 text-center"
                style={{ borderColor: "var(--border)", color: "var(--foreground)", backgroundColor: "var(--card)" }}
              >
                <span>📝</span> Detailed Journal
              </Link>
            </div>

            <div className="mt-2 space-y-2 border-t pt-3 text-xs" style={{ borderColor: "var(--border)" }}>
              <p className="font-bold text-xs" style={{ color: "var(--muted)" }}>Ask Bloom AI Guide:</p>
              <div className="flex flex-wrap gap-1.5">
                <Link
                  href="/chat"
                  className="rounded-xl px-2.5 py-1 text-[11px] font-semibold transition hover:scale-102"
                  style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, var(--card))", color: "var(--foreground)" }}
                >
                  💬 When is my next free period?
                </Link>
                <Link
                  href="/chat"
                  className="rounded-xl px-2.5 py-1 text-[11px] font-semibold transition hover:scale-102"
                  style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, var(--card))", color: "var(--foreground)" }}
                >
                  🍵 Foods for my phase
                </Link>
                <Link
                  href="/chat"
                  className="rounded-xl px-2.5 py-1 text-[11px] font-semibold transition hover:scale-102"
                  style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, var(--card))", color: "var(--foreground)" }}
                >
                  🧸 Cramp relief ideas
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
