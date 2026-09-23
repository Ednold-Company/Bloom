import { Cycle, Symptom } from "@prisma/client";

export type CyclePhase =
  | "MENSTRUAL"
  | "FOLLICULAR_SAFE"
  | "FERTILE_WINDOW"
  | "OVULATION"
  | "POST_OVULATION"
  | "LUTEAL_SAFE"
  | "PMS";

export type ConceptionRisk = "LOW" | "MEDIUM" | "HIGH" | "PEAK";

export type PredictionResult = {
  currentCycleDay: number;
  currentPhase: CyclePhase;
  currentPhaseLabel: string;
  conceptionRisk: ConceptionRisk;
  conceptionRiskLabel: string;
  conceptionBadgeClass: string;
  nextPeriodStart: Date;
  daysUntilNextPeriod: number;
  ovulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  averageCycleLength: number;
  lastPeriodStart: Date;
  safeSexSummary: {
    isTodaySafe: boolean;
    headline: string;
    description: string;
    safeWindowDates: string;
    fertileWindowDates: string;
    tip: string;
  };
  phaseIntelligence: {
    title: string;
    estrogen: string;
    progesterone: string;
    energy: string;
    mood: string;
    stickerEmoji: string;
    nutritionTip: string;
  };
};

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function formatDateRange(start: Date, end: Date) {
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", options)} – ${end.toLocaleDateString("en-US", options)}`;
}

export function predictCycle(cycles: Cycle[]): PredictionResult {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let averageCycleLength = 28;
  let lastStart = new Date(today);
  lastStart.setDate(lastStart.getDate() - 12); // Smart default: Day 13

  if (cycles.length > 0) {
    const sorted = [...cycles].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    lastStart = new Date(sorted[sorted.length - 1].startDate);
    lastStart.setHours(0, 0, 0, 0);

    if (sorted.length >= 2) {
      const lengths: number[] = [];
      for (let i = 1; i < sorted.length; i += 1) {
        const diff = daysBetween(new Date(sorted[i - 1].startDate), new Date(sorted[i].startDate));
        if (diff >= 20 && diff <= 45) {
          lengths.push(diff);
        }
      }
      if (lengths.length > 0) {
        averageCycleLength = Math.round(
          lengths.reduce((sum, val) => sum + val, 0) / lengths.length
        );
      }
    }
  }

  // Calculate day in current cycle
  const diffDays = daysBetween(lastStart, today);
  const currentCycleDay = (diffDays >= 0 ? diffDays % averageCycleLength : 0) + 1;

  // Luteal phase is typically 14 days before next period
  const ovulationDay = Math.max(10, averageCycleLength - 14);

  // Next period start
  const nextPeriodStart = new Date(lastStart);
  const cycleMultipliers = Math.max(1, Math.floor(diffDays / averageCycleLength) + 1);
  nextPeriodStart.setDate(lastStart.getDate() + averageCycleLength * cycleMultipliers);

  const daysUntilNextPeriod = Math.max(0, daysBetween(today, nextPeriodStart));

  // Key window dates
  const ovulationDate = new Date(lastStart);
  ovulationDate.setDate(lastStart.getDate() + (cycleMultipliers - 1) * averageCycleLength + (ovulationDay - 1));

  const fertileWindowStart = new Date(ovulationDate);
  fertileWindowStart.setDate(ovulationDate.getDate() - 5);

  const fertileWindowEnd = new Date(ovulationDate);
  fertileWindowEnd.setDate(ovulationDate.getDate() + 1);

  const follicularSafeEnd = new Date(fertileWindowStart);
  follicularSafeEnd.setDate(fertileWindowStart.getDate() - 1);

  const lutealSafeStart = new Date(fertileWindowEnd);
  lutealSafeStart.setDate(fertileWindowEnd.getDate() + 1);

  const lutealSafeEnd = new Date(nextPeriodStart);
  lutealSafeEnd.setDate(nextPeriodStart.getDate() - 1);

  // Determine current phase and safe sex risk
  let currentPhase: CyclePhase = "LUTEAL_SAFE";
  let currentPhaseLabel = "Luteal Phase (Safe Days)";
  let conceptionRisk: ConceptionRisk = "LOW";
  let conceptionRiskLabel = "Low Chance of Conception (Safe Days)";
  let conceptionBadgeClass = "badge-safe";

  if (currentCycleDay <= 5) {
    currentPhase = "MENSTRUAL";
    currentPhaseLabel = "Menstrual Phase";
    conceptionRisk = "LOW";
    conceptionRiskLabel = "Period Days • Very Low Conception Risk";
    conceptionBadgeClass = "badge-period";
  } else if (currentCycleDay < ovulationDay - 5) {
    currentPhase = "FOLLICULAR_SAFE";
    currentPhaseLabel = "Follicular Phase";
    conceptionRisk = "LOW";
    conceptionRiskLabel = "Low Chance of Conception (Pre-Fertile Window)";
    conceptionBadgeClass = "badge-safe";
  } else if (currentCycleDay >= ovulationDay - 5 && currentCycleDay < ovulationDay) {
    currentPhase = "FERTILE_WINDOW";
    currentPhaseLabel = "Fertile Window";
    conceptionRisk = "HIGH";
    conceptionRiskLabel = "High Chance of Pregnancy (Fertile Window)";
    conceptionBadgeClass = "badge-fertile";
  } else if (currentCycleDay === ovulationDay) {
    currentPhase = "OVULATION";
    currentPhaseLabel = "Ovulation Day (Peak)";
    conceptionRisk = "PEAK";
    conceptionRiskLabel = "Peak Fertility • Highest Conception Chance";
    conceptionBadgeClass = "badge-ovulation";
  } else if (currentCycleDay === ovulationDay + 1) {
    currentPhase = "POST_OVULATION";
    currentPhaseLabel = "Post-Ovulation Buffer";
    conceptionRisk = "MEDIUM";
    conceptionRiskLabel = "Medium Chance • Ovum Lifespan Window";
    conceptionBadgeClass = "badge-fertile";
  } else if (currentCycleDay >= averageCycleLength - 4) {
    currentPhase = "PMS";
    currentPhaseLabel = "PMS / Pre-Menstrual";
    conceptionRisk = "LOW";
    conceptionRiskLabel = "Low Chance of Conception (Luteal Safe Window)";
    conceptionBadgeClass = "badge-pms";
  } else {
    currentPhase = "LUTEAL_SAFE";
    currentPhaseLabel = "Luteal Phase";
    conceptionRisk = "LOW";
    conceptionRiskLabel = "Low Chance of Conception (Safe Days Window)";
    conceptionBadgeClass = "badge-safe";
  }

  // Safe sex summary logic
  const isTodaySafe = conceptionRisk === "LOW";
  let safeHeadline = "🟢 Low Chance of Pregnancy Today";
  let safeDesc =
    "You are currently outside your fertile window. In regular ovulatory cycles, this is a low-conception risk period for sex.";

  if (conceptionRisk === "HIGH" || conceptionRisk === "PEAK") {
    safeHeadline = "🔴 High Pregnancy Risk Window";
    safeDesc =
      "You are in your fertile window or peak ovulation. Sperm can survive up to 5 days, so unprotected intercourse has a high chance of conception.";
  } else if (conceptionRisk === "MEDIUM") {
    safeHeadline = "🟡 Medium Conception Chance";
    safeDesc =
      "The egg was released recently and may still be viable for up to 24 hours. Exercise caution if avoiding pregnancy.";
  }

  // Phase intelligence data
  const phaseIntelligenceMap: Record<CyclePhase, PredictionResult["phaseIntelligence"]> = {
    MENSTRUAL: {
      title: "Menstrual Phase (Rest & Nurture)",
      estrogen: "Low, slowly beginning to rise",
      progesterone: "Low",
      energy: "Cozy, reflective, slower pace",
      mood: "Introspective, gentle with yourself",
      stickerEmoji: "🧸",
      nutritionTip: "Enjoy warming iron-rich foods, dark chocolate, ginger tea, and soothing bone broths.",
    },
    FOLLICULAR_SAFE: {
      title: "Follicular Phase (Fresh & Blooming)",
      estrogen: "Steadily rising",
      progesterone: "Baseline low",
      energy: "Rising energy, social, motivated",
      mood: "Optimistic, creative, clear-headed",
      stickerEmoji: "🌸",
      nutritionTip: "Incorporate fermented foods, fresh berries, sprouts, and pumpkin/flax seeds for seed cycling.",
    },
    FERTILE_WINDOW: {
      title: "Fertile Window (Magnetic & Vibrant)",
      estrogen: "Surging to peak levels",
      progesterone: "Starting to awaken",
      energy: "High stamina, confidence & glow",
      mood: "Playful, outgoing, magnetic",
      stickerEmoji: "✨",
      nutritionTip: "Hydrate well with coconut water, leafy greens, avocados, and antioxidant-rich fruits.",
    },
    OVULATION: {
      title: "Ovulation Day (Peak Radiance)",
      estrogen: "Peak maximum (LH Surge)",
      progesterone: "Beginning rapid climb",
      energy: "Peak libido, supreme confidence",
      mood: "Empowered, radiant, loving",
      stickerEmoji: "💖",
      nutritionTip: "Zinc-rich pumpkin seeds, wild salmon, and cruciferous vegetables to help estrogen metabolism.",
    },
    POST_OVULATION: {
      title: "Post-Ovulation Transition",
      estrogen: "Declining slightly",
      progesterone: "Rising steadily",
      energy: "Transitioning to steady focus",
      mood: "Warm, grounding, calm",
      stickerEmoji: "🌷",
      nutritionTip: "Warm herbal infusions (chamomile or peppermint) and complex carbohydrates like sweet potatoes.",
    },
    LUTEAL_SAFE: {
      title: "Luteal Phase (Cozy & Focused)",
      estrogen: "Secondary mild peak",
      progesterone: "High (dominant hormone)",
      energy: "Organized, task-oriented, winding down",
      mood: "Nesting, craving comfort",
      stickerEmoji: "🧘‍♀️",
      nutritionTip: "Sesame and sunflower seeds, magnesium-rich spinach, roasted root veggies, and warm magnesium baths.",
    },
    PMS: {
      title: "Pre-Menstrual Days (Self-Care Mode)",
      estrogen: "Dropping toward baseline",
      progesterone: "Sharply declining",
      energy: "Needing extra sleep and quiet time",
      mood: "Sensitive, emotional, truth-seeking",
      stickerEmoji: "🍫",
      nutritionTip: "Dark chocolate (70%+), magnesium supplements, chamomile tea, and avoiding excess sodium/caffeine.",
    },
  };

  const safeWindowString = `${formatDateRange(lutealSafeStart, lutealSafeEnd)}`;
  const fertileWindowString = formatDateRange(fertileWindowStart, fertileWindowEnd);

  return {
    currentCycleDay,
    currentPhase,
    currentPhaseLabel,
    conceptionRisk,
    conceptionRiskLabel,
    conceptionBadgeClass,
    nextPeriodStart,
    daysUntilNextPeriod,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    averageCycleLength,
    lastPeriodStart: lastStart,
    safeSexSummary: {
      isTodaySafe,
      headline: safeHeadline,
      description: safeDesc,
      safeWindowDates: safeWindowString,
      fertileWindowDates: fertileWindowString,
      tip: "Note: Natural fertility awareness is for educational guidance. Cycle lengths can fluctuate with stress or travel.",
    },
    phaseIntelligence: phaseIntelligenceMap[currentPhase],
  };
}

export function predictSymptoms(symptoms: Symptom[]) {
  const counts: Record<string, number> = {};
  symptoms.forEach((symptom) => {
    if (symptom.mood) {
      counts[symptom.mood] = (counts[symptom.mood] || 0) + 1;
    }
  });

  const commonMood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Radiant";
  return { commonMood };
}
