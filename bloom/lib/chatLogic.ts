import { prisma } from "./prisma";
import { predictCycle, PredictionResult } from "./predictor";
import { Cycle, Symptom } from "@prisma/client";

export const RETENTION_DAYS = 30;
export const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

export function pickTopMoods(moods: string[]) {
  const counts: Record<string, number> = {};
  moods.forEach((mood) => {
    counts[mood] = (counts[mood] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([mood]) => mood);
}

export type ChatIntent =
  | "greeting"
  | "safe_sex"
  | "ovulation"
  | "next_period"
  | "cramps_pain"
  | "nutrition_food"
  | "pms_mood"
  | "cervical_mucus"
  | "cycle_phases"
  | "app_info"
  | "navigation"
  | "gratitude"
  | "general";

export function inferIntent(message: string): ChatIntent {
  const lower = message.toLowerCase().trim();

  // Safe sex, "free period", "free sex", pregnancy risk queries
  if (
    lower.includes("free period") ||
    lower.includes("safe period") ||
    lower.includes("sex free") ||
    lower.includes("free sex") ||
    lower.includes("safe sex") ||
    lower.includes("safe day") ||
    lower.includes("safe to") ||
    lower.includes("unprotected") ||
    lower.includes("pregnancy") ||
    lower.includes("pregnant") ||
    lower.includes("conception") ||
    lower.includes("have sex") ||
    lower.includes("can i sex") ||
    lower.includes("condom") ||
    lower.includes("birth control") ||
    lower.includes("risk of sex") ||
    lower.includes("safe time") ||
    lower.includes("is today safe") ||
    lower.includes("am i safe") ||
    lower.includes("free to do") ||
    (lower.includes("sex") && !lower.includes("symptoms"))
  ) {
    return "safe_sex";
  }

  // Next menstrual period queries
  if (
    lower.includes("next period") ||
    lower.includes("period due") ||
    lower.includes("when is my period") ||
    lower.includes("when will my period") ||
    lower.includes("period start") ||
    lower.includes("when will i bleed") ||
    lower.includes("days until period") ||
    lower.includes("when is period") ||
    (lower.includes("when") && lower.includes("period")) ||
    (lower.includes("next") && lower.includes("period")) ||
    lower.includes("late period") ||
    lower.includes("delayed")
  ) {
    return "next_period";
  }

  // Ovulation & fertile window
  if (
    lower.includes("ovulat") ||
    lower.includes("fertile") ||
    lower.includes("fertility") ||
    lower.includes("conception window") ||
    lower.includes("egg release") ||
    lower.includes("conceive") ||
    lower.includes("get pregnant")
  ) {
    return "ovulation";
  }

  // Cramps and pain
  if (
    lower.includes("cramp") ||
    lower.includes("pain") ||
    lower.includes("hurts") ||
    lower.includes("ache") ||
    lower.includes("sore") ||
    lower.includes("headache") ||
    lower.includes("relief") ||
    lower.includes("backache")
  ) {
    return "cramps_pain";
  }

  // Nutrition, diet, seed cycling, foods
  if (
    lower.includes("food") ||
    lower.includes("eat") ||
    lower.includes("diet") ||
    lower.includes("nutrition") ||
    lower.includes("seed cycling") ||
    lower.includes("tea") ||
    lower.includes("magnesium") ||
    lower.includes("craving") ||
    lower.includes("recipe") ||
    lower.includes("snack")
  ) {
    return "nutrition_food";
  }

  // PMS and mood
  if (
    lower.includes("pms") ||
    lower.includes("mood") ||
    lower.includes("crying") ||
    lower.includes("sad") ||
    lower.includes("anxious") ||
    lower.includes("irritated") ||
    lower.includes("angry") ||
    lower.includes("emotional") ||
    lower.includes("depressed") ||
    lower.includes("feel down")
  ) {
    return "pms_mood";
  }

  // Cervical mucus / discharge
  if (
    lower.includes("discharge") ||
    lower.includes("mucus") ||
    lower.includes("fluid") ||
    lower.includes("cervical") ||
    lower.includes("egg white") ||
    lower.includes("wet")
  ) {
    return "cervical_mucus";
  }

  // Cycle phases explanation
  if (
    lower.includes("phase") ||
    lower.includes("follicular") ||
    lower.includes("luteal") ||
    lower.includes("menstrual") ||
    lower.includes("estrogen") ||
    lower.includes("progesterone") ||
    lower.includes("hormone") ||
    lower.includes("cycle day")
  ) {
    return "cycle_phases";
  }

  // Greetings
  if (
    lower.startsWith("hi") ||
    lower.startsWith("hello") ||
    lower.startsWith("hey") ||
    lower.includes("good morning") ||
    lower.includes("good evening") ||
    lower.includes("how are you")
  ) {
    return "greeting";
  }

  // Thanks / Gratitude
  if (
    lower.includes("thank") ||
    lower.includes("thanks") ||
    lower.includes("awesome") ||
    lower.includes("great") ||
    lower.includes("got it") ||
    lower.includes("ok")
  ) {
    return "gratitude";
  }

  if (
    lower.includes("navigate") ||
    lower.includes("where") ||
    lower.includes("dashboard") ||
    lower.includes("calendar") ||
    lower.includes("symptom") ||
    lower.includes("insight")
  ) {
    return "navigation";
  }

  if (lower.includes("what is bloom") || lower.includes("how to use") || lower.includes("about")) {
    return "app_info";
  }

  return "general";
}

export function generateAssistantReply(
  message: string,
  cycles: Cycle[],
  symptoms: Symptom[]
): string {
  const intent = inferIntent(message);
  const prediction: PredictionResult = predictCycle(cycles);
  const topMoods = pickTopMoods(symptoms.map((s) => s.mood).filter(Boolean) as string[]);

  const dateOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const nextPeriodStr = prediction.nextPeriodStart.toLocaleDateString("en-US", dateOpts);
  const ovulationStr = prediction.ovulationDate.toLocaleDateString("en-US", dateOpts);
  const fertileStartStr = prediction.fertileWindowStart.toLocaleDateString("en-US", dateOpts);
  const fertileEndStr = prediction.fertileWindowEnd.toLocaleDateString("en-US", dateOpts);

  switch (intent) {
    case "safe_sex": {
      if (prediction.conceptionRisk === "HIGH" || prediction.conceptionRisk === "PEAK") {
        return `⚠️ **High Pregnancy Risk Today**: You are currently in your **${prediction.currentPhaseLabel}** (Day ${prediction.currentCycleDay} of ${prediction.averageCycleLength}).\n\n🌸 **Fertile Window**: ${fertileStartStr} – ${fertileEndStr} (Ovulation Peak: **${ovulationStr}**).\n\n🛡️ **When is your next Safe / "Free" Sex Window?**\nYour next low-conception risk window begins on **Day ${Math.max(10, prediction.averageCycleLength - 14) + 2} (${prediction.safeSexSummary.safeWindowDates})** once ovulation passes and the egg has dissolved.\n\n💡 *Sperm can live up to 5 days in fertile fluid, so having unprotected sex during your fertile window carries a high chance of conception.*`;
      } else if (prediction.conceptionRisk === "MEDIUM") {
        return `🟡 **Medium Conception Chance**: You are in the 24-hour buffer right after ovulation (Day ${prediction.currentCycleDay}). An egg remains viable for 12–24 hours post-release.\n\n✨ **Your next Safe / "Free" Sex Window**: Fully begins in **1–2 days** (Day ${prediction.currentCycleDay + 2}) throughout your Luteal phase until your next period (${nextPeriodStr}).`;
      } else {
        return `🟢 **Safe Days / Free Sex Window Active**: You are currently on **Day ${prediction.currentCycleDay} (${prediction.currentPhaseLabel})**.\n\n💖 **Safe Window Dates**: ${prediction.safeSexSummary.safeWindowDates}.\nDuring this post-ovulation luteal phase, the egg has already dissolved, making the chance of pregnancy very low in standard ovulatory cycles.\n\n🩸 **Next Period**: Expected in ~${prediction.daysUntilNextPeriod} days (${nextPeriodStr}).\n\n💡 *Note: Natural cycle tracking is an educational guide. Stress, illness, or travel can sometimes cause minor ovulation shifts.*`;
      }
    }

    case "next_period": {
      return `🌸 **Next Period Forecast**:\n\n• **Expected Date**: **${nextPeriodStr}** (in ~${prediction.daysUntilNextPeriod} days)\n• **Current Status**: Day ${prediction.currentCycleDay} of ${prediction.averageCycleLength} (${prediction.currentPhaseLabel})\n• **Ovulation Peak**: ${ovulationStr}\n• **Safe Sex Window**: ${prediction.safeSexSummary.safeWindowDates}\n\nBloom updates this dynamically with every cycle you log in the Calendar! 🌷`;
    }

    case "ovulation": {
      return `🌺 **Ovulation & Fertility Forecast**:\n\n• **Current Cycle Day**: Day ${prediction.currentCycleDay} of ${prediction.averageCycleLength}\n• **Fertile Window (High Chance)**: ${fertileStartStr} to ${fertileEndStr}\n• **Estimated Ovulation Peak**: **${ovulationStr}**\n• **Safe Sex Window ("Free Days")**: ${prediction.safeSexSummary.safeWindowDates}\n\n✨ *Signs of ovulation: Clear stretchy "egg-white" cervical fluid, a slight rise in temperature, and increased libido.*`;
    }

    case "cramps_pain": {
      return `🧸 **Gentle Cramp & Pain Relief Tips**:\n\n1. 🫖 **Warm Herbal Teas**: Chamomile, ginger, and raspberry leaf help relax uterine muscles.\n2. 🛁 **Magnesium & Heat**: Place a warm heating pad on your lower abdomen and soak in an Epsom salt bath.\n3. 🍫 **Dark Chocolate**: High in magnesium and natural mood boosters.\n4. 🧘‍♀️ **Gentle Movement**: Child's pose and cat-cow stretches release pelvic tension.\n\n*If you experience severe pain, always consult your healthcare provider.* 💖`;
    }

    case "nutrition_food": {
      return `🥑 **Nourishing Your Current Phase (${prediction.currentPhaseLabel})**:\n\n• **Today's Tip**: ${prediction.phaseIntelligence.nutritionTip}\n• **Seed Cycling**: ${prediction.currentCycleDay <= 14 ? "Pumpkin & Flax seeds (Phase 1: Estrogen support)" : "Sunflower & Sesame seeds (Phase 2: Progesterone support)"}.\n• **Hydration**: Drink plenty of warm water, peppermint or chamomile tea, and coconut water! 🍵`;
    }

    case "pms_mood": {
      return `🍫 **Pre-Menstrual & Mood Care**:\n\nDuring the late luteal/PMS phase, progesterone drops, which can trigger cravings, tiredness, or emotional sensitivity. This is completely natural!\n\n✨ **Quick Self-Care Action**:\n• Prioritize 8+ hours of restful sleep.\n• Reduce excess refined sugars and caffeine.\n• Take a cozy 20-minute walk in natural light.\n• Indulge in warm tea and gentle boundaries. 🧸`;
    }

    case "cervical_mucus": {
      return `💧 **Cervical Fluid & Ovulation Guide**:\n\n• **Post-Period**: Dry or sticky (low fertility)\n• **Approaching Ovulation**: Creamy, lotion-like (rising fertility)\n• **Peak Fertile Window**: Clear, slippery, stretchy like raw egg-whites (maximum fertility)\n• **Post-Ovulation / Safe Days**: Thick, sticky, or dry (low fertility)\n\nLogging changes in the Symptoms tab helps refine your predictions! 🌸`;
    }

    case "cycle_phases": {
      return `🌙 **The 4 Seasons of Your Cycle**:\n\n1. 🩸 **Winter (Menstrual, Days 1–5)**: Rest & recharge.\n2. 🌱 **Spring (Follicular, Days 6–11)**: Rising estrogen, high energy.\n3. 🌺 **Summer (Ovulation, Days 12–16)**: Peak magnetism, fertile window.\n4. 🍂 **Autumn (Luteal, Days 17–28)**: Progesterone dominant, cozy safe days.\n\nCurrently, you are on **Day ${prediction.currentCycleDay} (${prediction.currentPhaseLabel})**. ✨`;
    }

    case "gratitude": {
      return `You're so very welcome, lovely! 🌸 I'm always right here whenever you need cycle predictions, safe sex guidance, or gentle wellness tips. Take good care of yourself today! 💖`;
    }

    case "greeting": {
      return `Hello lovely! 🌸 I am **Bloom AI Guide**, your gentle wellness companion.\n\n• **Today**: Day ${prediction.currentCycleDay} of ${prediction.averageCycleLength} (${prediction.currentPhaseLabel})\n• **Next Period**: ${nextPeriodStr} (~${prediction.daysUntilNextPeriod} days)\n• **Conception Risk**: ${prediction.conceptionRiskLabel}\n\nWhat would you like to explore today? 🌷`;
    }

    case "navigation": {
      return `✨ **Navigating Bloom**:\n\n• 📊 **Dashboard**: Live cycle ring, safe days chart & quick sticker logs.\n• 📅 **Calendar**: Log period dates and see past history.\n• 📝 **Symptoms**: Daily mood, flow, cramps, and sticker journaling.\n• 📈 **Insights**: Detailed cycle length and mood charts.`;
    }

    case "app_info": {
      return `🌸 **About Bloom**:\n\nBloom is your private, aesthetic cycle tracker and health companion designed to empower you with science-backed predictions, fertility windows, safe days guidance, and supportive daily wellness tips.\n\nEverything is stored with local privacy and Progressive Web App (PWA) offline capabilities! 💖`;
    }

    default: {
      const moodContext = topMoods.length ? `(Recent moods: ${topMoods.join(", ")})` : "";
      return `I'm here for you! 🌸 ${moodContext}\n\n• **Current Cycle Day**: Day ${prediction.currentCycleDay} of ${prediction.averageCycleLength} (${prediction.currentPhaseLabel})\n• **Conception Risk Today**: ${prediction.conceptionRiskLabel}\n• **Next Period**: Expected around **${nextPeriodStr}** (in ~${prediction.daysUntilNextPeriod} days)\n• **Safe Sex Window**: ${prediction.safeSexSummary.safeWindowDates}\n\nYou can ask me specific questions like *"When is my next free period?"*, *"Is today safe for sex?"*, *"How to soothe cramps?"*, or *"What to eat today?"*! ✨`;
    }
  }
}

export async function purgeOldLogs(userId: string) {
  const cutoff = new Date(Date.now() - RETENTION_MS);
  await prisma.chatLog.deleteMany({
    where: { userId, createdAt: { lt: cutoff } },
  });
  return cutoff;
}
