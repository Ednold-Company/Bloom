"use client";

import { useState } from "react";
import { PredictionResult } from "@/lib/predictor";

interface FertilityPieChartProps {
  prediction: PredictionResult;
}

export default function FertilityPieChart({ prediction }: FertilityPieChartProps) {
  const totalDays = prediction.averageCycleLength || 28;
  const currentDay = prediction.currentCycleDay || 1;

  const ovulationDay = Math.max(10, totalDays - 14);
  const fertileStartDay = Math.max(5, ovulationDay - 5);
  const fertileEndDay = ovulationDay + 1;

  // Breakdown of days
  const periodDays = 5;
  const preFertileSafeDays = Math.max(0, fertileStartDay - periodDays - 1);
  const fertileDays = fertileEndDay - fertileStartDay;
  const ovulationDays = 1;
  const postOvulationSafeDays = totalDays - fertileEndDay;
  const totalSafeDays = preFertileSafeDays + postOvulationSafeDays;

  // Slices configuration for Donut Chart
  const slices = [
    {
      id: "safe_luteal",
      label: "Safe Sex Window (Luteal)",
      days: postOvulationSafeDays,
      percentage: Math.round((postOvulationSafeDays / totalDays) * 100),
      color: "#10b981",
      icon: "🟢",
      chance: "Lowest Chance (Safe)",
      description: "Post-ovulation days. The egg has dissolved, making it the safest time for sex without conception.",
    },
    {
      id: "period",
      label: "Period (Menstruation)",
      days: periodDays,
      percentage: Math.round((periodDays / totalDays) * 100),
      color: "#e11d48",
      icon: "🩸",
      chance: "Low Chance",
      description: "Active flow days. Uterine lining sheds.",
    },
    {
      id: "safe_follicular",
      label: "Safe Days (Follicular)",
      days: preFertileSafeDays,
      percentage: Math.round((preFertileSafeDays / totalDays) * 100),
      color: "#34d399",
      icon: "🟢",
      chance: "Low Chance (Pre-Fertile)",
      description: "Before sperm survival window starts. Low pregnancy probability.",
    },
    {
      id: "fertile",
      label: "Fertile Window",
      days: fertileDays,
      percentage: Math.round((fertileDays / totalDays) * 100),
      color: "#ff5277",
      icon: "🌸",
      chance: "High Chance of Pregnancy",
      description: "Sperm can live up to 5 days in fertile mucus waiting for the egg.",
    },
    {
      id: "ovulation",
      label: "Ovulation Peak",
      days: ovulationDays,
      percentage: Math.round((ovulationDays / totalDays) * 100),
      color: "#f59e0b",
      icon: "🌺",
      chance: "Peak Fertility (Maximum)",
      description: "Egg is released! Highest likelihood of pregnancy.",
    },
  ];

  const [activeSliceId, setActiveSliceId] = useState<string>(
    prediction.conceptionRisk === "HIGH" || prediction.conceptionRisk === "PEAK" ? "fertile" : "safe_luteal"
  );

  const activeSlice = slices.find((s) => s.id === activeSliceId) || slices[0];

  // Calculate SVG stroke dashes for circumference 2 * Math.PI * 52 ≈ 326.7
  const circumference = 326.7;
  let accumulatedPercent = 0;

  return (
    <div className="rounded-3xl border p-4 md:p-6 glass-card shadow-lg space-y-5" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
      {/* Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🥧</span>
            <h3 className="font-display text-lg font-bold" style={{ color: "var(--foreground)" }}>
              Fertility vs Safe Sex Breakdown
            </h3>
          </div>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Proportion of safe "free sex" days vs fertile high-risk days in your {totalDays}-day cycle
          </p>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 self-start md:self-auto">
          🟢 {totalSafeDays} Total Safe Days ({Math.round((totalSafeDays / totalDays) * 100)}%)
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] items-center">
        {/* SVG Donut Chart */}
        <div className="relative flex items-center justify-center py-2">
          <svg viewBox="0 0 140 140" className="h-52 w-52 transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="70"
              cy="70"
              r="52"
              fill="none"
              stroke="color-mix(in srgb, var(--border) 60%, transparent)"
              strokeWidth="18"
            />
            {slices.map((slice) => {
              const dashLength = (slice.days / totalDays) * circumference;
              const gapLength = circumference - dashLength;
              const offset = -accumulatedPercent * circumference;
              accumulatedPercent += slice.days / totalDays;
              const isSelected = activeSliceId === slice.id;

              return (
                <circle
                  key={slice.id}
                  cx="70"
                  cy="70"
                  r="52"
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={isSelected ? "22" : "18"}
                  strokeDasharray={`${dashLength} ${gapLength}`}
                  strokeDashoffset={offset}
                  className="transition-all duration-300 cursor-pointer hover:opacity-90"
                  onClick={() => setActiveSliceId(slice.id)}
                  style={{
                    filter: isSelected ? "drop-shadow(0 2px 8px rgba(0,0,0,0.25))" : "none",
                  }}
                />
              );
            })}
          </svg>

          {/* Center Content Inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            <span className="text-[10px] uppercase tracking-wider font-extrabold" style={{ color: "var(--muted)" }}>
              Today
            </span>
            <span className="font-display text-2xl font-black text-[#ff5277]">
              Day {currentDay}
            </span>
            <span className="text-[11px] font-bold mt-0.5 line-clamp-1" style={{ color: "var(--foreground)" }}>
              {prediction.currentPhaseLabel}
            </span>
          </div>
        </div>

        {/* Interactive Slice Detail Card */}
        <div
          className="rounded-2xl border p-4 space-y-3 transition-all"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "color-mix(in srgb, var(--accent) 5%, var(--card))",
          }}
        >
          <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{activeSlice.icon}</span>
              <div>
                <h4 className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
                  {activeSlice.label}
                </h4>
                <p className="text-[11px] font-semibold text-[#ff5277]">
                  {activeSlice.days} days ({activeSlice.percentage}% of cycle)
                </p>
              </div>
            </div>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold"
              style={{
                backgroundColor: `color-mix(in srgb, ${activeSlice.color} 20%, var(--card))`,
                color: activeSlice.color,
              }}
            >
              {activeSlice.chance}
            </span>
          </div>

          <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
            {activeSlice.description}
          </p>

          {/* Quick interactive slice buttons */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {slices.map((slice) => (
              <button
                key={slice.id}
                type="button"
                onClick={() => setActiveSliceId(slice.id)}
                className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  activeSliceId === slice.id ? "scale-105 ring-1" : "opacity-75 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: `color-mix(in srgb, ${slice.color} 15%, var(--card))`,
                  color: "var(--foreground)",
                  borderColor: slice.color,
                }}
              >
                {slice.icon} {slice.days}d
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

