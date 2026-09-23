"use client";

import { useState } from "react";
import { PredictionResult } from "@/lib/predictor";

interface CycleTimelineChartProps {
  prediction: PredictionResult;
}

export default function CycleTimelineChart({ prediction }: CycleTimelineChartProps) {
  const totalDays = prediction.averageCycleLength || 28;
  const currentDay = prediction.currentCycleDay || 1;
  const [activeDay, setActiveDay] = useState<number>(currentDay);

  const ovulationDay = Math.max(10, totalDays - 14);
  const fertileStartDay = Math.max(5, ovulationDay - 5);
  const fertileEndDay = ovulationDay + 1;
  const pmsStartDay = Math.max(18, totalDays - 4);

  const getDayInfo = (day: number) => {
    const dayOffset = day - currentDay;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dayOffset);
    const dateStr = targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    if (day <= 5) {
      return {
        phase: "Menstrual Phase (Period)",
        shortPhase: "Period",
        isSafe: true,
        risk: "Low Risk",
        badgeClass: "badge-period",
        color: "#e11d48",
        bg: "rgba(225, 29, 72, 0.15)",
        icon: "🩸",
        desc: "Active menstruation flow. Conception probability is low, but sperm can live up to 5 days.",
        sexGuidance: "Low risk of conception. Use comfort and hygiene care.",
        dateStr,
      };
    } else if (day < fertileStartDay) {
      return {
        phase: "Follicular Safe Days (Pre-Fertile)",
        shortPhase: "Safe Window",
        isSafe: true,
        risk: "Low Risk • Safe Day",
        badgeClass: "badge-safe",
        color: "#10b981",
        bg: "rgba(16, 185, 129, 0.15)",
        icon: "🟢",
        desc: "Estrogen is gently rising as follicles develop. Outside the fertile window.",
        sexGuidance: "🟢 Free Sex Window: Low probability of pregnancy.",
        dateStr,
      };
    } else if (day === ovulationDay) {
      return {
        phase: "Ovulation Day (Peak)",
        shortPhase: "Ovulation Peak",
        isSafe: false,
        risk: "Peak Risk • Highest Chance",
        badgeClass: "badge-ovulation",
        color: "#d97706",
        bg: "rgba(217, 119, 6, 0.18)",
        icon: "🌺",
        desc: "The mature egg is released! Maximum fertility and highest chance of conception.",
        sexGuidance: "🔴 High Pregnancy Chance: Use protection if avoiding pregnancy.",
        dateStr,
      };
    } else if (day >= fertileStartDay && day <= fertileEndDay) {
      return {
        phase: "Fertile Window",
        shortPhase: "Fertile Window",
        isSafe: false,
        risk: "High Risk • Fertile",
        badgeClass: "badge-fertile",
        color: "#ff5277",
        bg: "rgba(255, 82, 119, 0.15)",
        icon: "🌸",
        desc: "Sperm can survive up to 5 days waiting for the egg. High likelihood of pregnancy.",
        sexGuidance: "🔴 High Conception Window: Abstain or use barrier protection to avoid pregnancy.",
        dateStr,
      };
    } else if (day >= pmsStartDay) {
      return {
        phase: "Late Luteal / PMS Safe Days",
        shortPhase: "PMS Safe Days",
        isSafe: true,
        risk: "Low Risk • Safe Day",
        badgeClass: "badge-pms",
        color: "#7c4dff",
        bg: "rgba(124, 77, 255, 0.15)",
        icon: "🍫",
        desc: "Progesterone declines before the period. Egg has dissolved completely.",
        sexGuidance: "🟢 Free Sex Window: Safe from conception. Enjoy self-care and cozy vibes.",
        dateStr,
      };
    } else {
      return {
        phase: "Luteal Phase (Safe / Free Sex Window)",
        shortPhase: "Safe Window",
        isSafe: true,
        risk: "Low Risk • Safe Day",
        badgeClass: "badge-safe",
        color: "#10b981",
        bg: "rgba(16, 185, 129, 0.15)",
        icon: "🟢",
        desc: "Post-ovulation luteal phase. Egg has passed and cannot be fertilized.",
        sexGuidance: "🟢 Free Sex Window: Safe from pregnancy in normal ovulatory cycles.",
        dateStr,
      };
    }
  };

  const selectedInfo = getDayInfo(activeDay);

  // Calculate days until next safe window
  let safeCountdownText = "";
  if (currentDay < fertileStartDay) {
    safeCountdownText = `🟢 Safe Days are ACTIVE now through Day ${fertileStartDay - 1}`;
  } else if (currentDay >= fertileStartDay && currentDay <= fertileEndDay) {
    const daysLeft = fertileEndDay - currentDay + 1;
    safeCountdownText = `🌸 Fertile Window active. Next Free/Safe Sex Window begins in ${daysLeft} ${daysLeft === 1 ? "day" : "days"} (Day ${fertileEndDay + 1})`;
  } else {
    safeCountdownText = `🟢 Free Sex / Safe Window is ACTIVE now through Day ${totalDays} (until next period in ${prediction.daysUntilNextPeriod} days)`;
  }

  return (
    <div className="space-y-5 rounded-3xl border p-4 md:p-6 glass-card shadow-lg" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
      {/* Header & Live Communication */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h3 className="font-display text-lg font-bold" style={{ color: "var(--foreground)" }}>
              Interactive Cycle & Safe Days Chart
            </h3>
          </div>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            Tap any day to see its fertility status, pregnancy risk, and safe sex forecast
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 15%, var(--card))", color: "var(--accent)" }}>
            <span className="h-2 w-2 rounded-full bg-[#ff5277] animate-ping" />
            Live: Day {currentDay}
          </span>
        </div>
      </div>

      {/* Live Communicating Alert Banner */}
      <div
        className="flex items-center gap-3 rounded-2xl p-3.5 text-xs md:text-sm font-semibold border transition-all"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "color-mix(in srgb, var(--accent) 8%, var(--card))",
          color: "var(--foreground)",
        }}
      >
        <span className="text-lg">✨</span>
        <div className="flex-1">
          <p className="font-bold text-[#ff5277]">{safeCountdownText}</p>
        </div>
      </div>

      {/* Full 28-Day Visual Interactive Bar (Mobile-friendly horizontal scroll / grid) */}
      <div>
        <div className="mb-2 flex items-center justify-between text-xs font-bold" style={{ color: "var(--muted)" }}>
          <span>Day 1 (Period Start)</span>
          <span>Day {ovulationDay} (Ovulation Peak)</span>
          <span>Day {totalDays} (Cycle End)</span>
        </div>

        {/* The 28-Day Bar */}
        <div className="grid grid-cols-14 md:grid-cols-28 gap-1 p-1.5 rounded-2xl border bg-black/5 dark:bg-white/5" style={{ borderColor: "var(--border)" }}>
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
            const info = getDayInfo(day);
            const isToday = day === currentDay;
            const isSelected = day === activeDay;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setActiveDay(day)}
                className={`relative flex flex-col items-center justify-center py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer select-none ${
                  isSelected
                    ? "ring-2 ring-[#ff5277] ring-offset-1 scale-105 z-10 shadow-md"
                    : "hover:scale-102 hover:opacity-100 opacity-90"
                }`}
                style={{
                  backgroundColor: info.bg,
                  color: info.color,
                }}
                title={`Day ${day}: ${info.phase}`}
              >
                <span>{day}</span>
                {isToday ? (
                  <span className="absolute -top-1.5 -right-1 h-2.5 w-2.5 rounded-full bg-[#ff5277] border-2 border-white dark:border-black animate-pulse" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Day Inspector Box */}
      <div
        className="rounded-2xl border p-4 md:p-5 transition-all space-y-3"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "color-mix(in srgb, var(--accent) 5%, var(--card))",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{selectedInfo.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display font-bold text-sm md:text-base" style={{ color: "var(--foreground)" }}>
                  Day {activeDay} ({selectedInfo.dateStr})
                </h4>
                {activeDay === currentDay ? (
                  <span className="rounded-full bg-[#ff5277] px-2 py-0.5 text-[10px] font-extrabold text-white">
                    TODAY
                  </span>
                ) : null}
              </div>
              <p className="text-xs font-semibold text-[#ff5277]">{selectedInfo.phase}</p>
            </div>
          </div>

          <span className={`rounded-full px-3 py-1 text-xs font-bold ${selectedInfo.badgeClass}`}>
            {selectedInfo.risk}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 text-xs md:text-sm">
          <div className="rounded-xl p-3" style={{ backgroundColor: "var(--card)" }}>
            <span className="font-bold text-xs uppercase tracking-wider block mb-1 text-[#ff5277]">
              🛡️ Safe Sex Guidance:
            </span>
            <p className="font-semibold" style={{ color: "var(--foreground)" }}>
              {selectedInfo.sexGuidance}
            </p>
          </div>

          <div className="rounded-xl p-3" style={{ backgroundColor: "var(--card)" }}>
            <span className="font-bold text-xs uppercase tracking-wider block mb-1" style={{ color: "var(--muted)" }}>
              🌸 Body & Biology:
            </span>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
              {selectedInfo.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Color Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 pt-1 text-[11px] font-semibold" style={{ color: "var(--muted)" }}>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-emerald-500" /> 🟢 Free Sex / Safe Days
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5277]" /> 🌸 Fertile Window
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-amber-500" /> 🌺 Ovulation Peak
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-rose-600" /> 🩸 Period Active
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-purple-500" /> 🍫 PMS Phase
        </span>
      </div>
    </div>
  );
}

