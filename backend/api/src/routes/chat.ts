import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

const chatSchema = z.object({ message: z.string().min(1) });
const RETENTION_DAYS = 30;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

type CycleSummary = {
  lastStart?: Date;
  averageLength?: number;
};

function pickTopMoods(moods: string[]) {
  const counts: Record<string, number> = {};
  moods.forEach((mood) => {
    counts[mood] = (counts[mood] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([mood]) => mood);
}

function inferIntent(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) return "greeting";
  if (lower.includes("tell me more")) return "tell_more";
  if (lower.includes("navigate") || lower.includes("where") || lower.includes("go to")) return "navigation";
  if (lower.includes("dashboard") || lower.includes("calendar") || lower.includes("symptom") || lower.includes("chat") || lower.includes("insight")) {
    return "navigation";
  }
  if (lower.includes("what") && lower.includes("app")) return "app_info";
  if (lower.includes("how") && lower.includes("use")) return "app_info";
  if (lower.includes("average") && lower.includes("cycle")) return "avg_cycle";
  if (lower.includes("ovulation") || (lower.includes("fertile") && lower.includes("window"))) return "ovulation";
  if (lower.includes("last three") || lower.includes("last 3")) return "last_three";
  if (lower.includes("last period") || lower.includes("most recent period")) return "last_period";
  if (lower.includes("how long") && lower.includes("period")) return "last_period_length";
  if (lower.includes("period") || lower.includes("cycle") || lower.includes("ovulation") || lower.includes("pms")) {
    return "cycle";
  }
  if (lower.includes("food") || lower.includes("eat") || lower.includes("cramp") || lower.includes("pain")) return "wellness";
  if (lower.includes("mood")) return "mood";
  return "general";
}

function respondToNavigation(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("dashboard")) return "Dashboard shows your next period, ovulation, and quick actions.";
  if (lower.includes("calendar")) return "Open Calendar to log period start/end dates and update a period later.";
  if (lower.includes("symptom")) return "Open Symptoms to log mood, cramps, sleep, energy, and notes.";
  if (lower.includes("chat")) return "You're here. Ask about your cycle, predictions, or tips.";
  if (lower.includes("insight")) return "Open Insights to see your cycle chart, mood highlights, and food suggestions.";
  return "Go to Dashboard for predictions, Calendar for periods, Symptoms for logs, and Insights for charts.";
}

function summarizeCycles(starts: Date[]): CycleSummary {
  if (starts.length < 2) return { lastStart: starts[0] };
  const diffs = [] as number[];
  for (let i = 1; i < starts.length; i += 1) {
    diffs.push(Math.round((starts[i].getTime() - starts[i - 1].getTime()) / (1000 * 60 * 60 * 24)));
  }
  const averageLength = Math.round(diffs.reduce((sum, value) => sum + value, 0) / diffs.length);
  return { lastStart: starts[starts.length - 1], averageLength };
}

function classyClose() {
  return "Anything else you'd like to explore?";
}

async function purgeOldLogs(userId: string) {
  const cutoff = new Date(Date.now() - RETENTION_MS);
  await prisma.chatLog.deleteMany({
    where: { userId, createdAt: { lt: cutoff } },
  });
  return cutoff;
}

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const userId = req.userId!;
  await purgeOldLogs(userId);
  const message = parsed.data.message;
  const intent = inferIntent(message);

  const [cycles, symptoms] = await Promise.all([
    prisma.cycle.findMany({ where: { userId }, orderBy: { startDate: "asc" } }),
    prisma.symptom.findMany({ where: { userId }, orderBy: { date: "desc" } }),
  ]);

  const cycleStarts = cycles.map((cycle) => new Date(cycle.startDate));
  const cycleSummary = summarizeCycles(cycleStarts);
  const recentCycles = [...cycles].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  let reply = "I'm here to help with cycle tracking, symptoms, and wellness tips.";

  if (intent === "greeting") {
    reply = "Hi there. I'm Bloom Guide. I can help you log cycles, understand predictions, or suggest wellness tips.";
  } else if (intent === "tell_more") {
    reply =
      "Bloom works best in three steps: (1) Log period start/end in Calendar, (2) log symptoms in Symptoms, and (3) review predictions and Insights for patterns. You can ask me about your cycle or how to navigate any screen.";
  } else if (intent === "navigation") {
    reply = respondToNavigation(message);
  } else if (intent === "app_info") {
    reply =
      "Bloom helps you track periods and symptoms, see predictions, and view insights. Start on Dashboard, log cycles in Calendar, and log symptoms in Symptoms. Insights appears after 2 cycles.";
  } else if (intent === "cycle") {
    if (!cycleStarts.length) {
      reply = "I don't have any cycle data yet. Log your first period start in Calendar to begin predictions.";
    } else if (cycleStarts.length < 2) {
      reply = "You have one cycle logged. Log a second cycle to unlock predictions and Insights charts.";
    } else if (cycleSummary.lastStart && cycleSummary.averageLength) {
      const nextStart = new Date(
        cycleSummary.lastStart.getTime() + cycleSummary.averageLength * 24 * 60 * 60 * 1000
      );
      reply = `Based on your data, your average cycle is about ${cycleSummary.averageLength} days. Your next period is expected around ${nextStart.toDateString()}.`;
    }
  } else if (intent === "avg_cycle") {
    if (!cycleSummary.averageLength) {
      reply = "I need at least two cycles to calculate your average cycle length.";
    } else {
      reply = `Your average cycle length is about ${cycleSummary.averageLength} days.`;
    }
  } else if (intent === "ovulation") {
    if (!cycleSummary.lastStart || !cycleSummary.averageLength) {
      reply = "Log at least two cycles so I can estimate your ovulation window.";
    } else {
      const nextStart = new Date(
        cycleSummary.lastStart.getTime() + cycleSummary.averageLength * 24 * 60 * 60 * 1000
      );
      const ovulation = new Date(nextStart.getTime() - 14 * 24 * 60 * 60 * 1000);
      const fertileStart = new Date(ovulation.getTime() - 5 * 24 * 60 * 60 * 1000);
      reply = `Estimated ovulation is around ${ovulation.toDateString()}. Your fertile window is about ${fertileStart.toDateString()} to ${ovulation.toDateString()}.`;
    }
  } else if (intent === "last_period") {
    const latest = recentCycles[0];
    if (!latest) {
      reply = "I don't have any period data yet. Log a start date in Calendar to begin.";
    } else {
      reply = `Your most recent period started on ${new Date(latest.startDate).toDateString()}.`;
    }
  } else if (intent === "last_period_length") {
    const latest = recentCycles.find((cycle) => cycle.endDate);
    if (!latest || !latest.endDate) {
      reply =
        "I don't have an end date for your most recent period yet. Add the end date in Calendar to calculate length.";
    } else {
      const lengthDays = Math.round(
        (new Date(latest.endDate).getTime() - new Date(latest.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      reply = `Your last period length was about ${lengthDays + 1} days.`;
    }
  } else if (intent === "last_three") {
    if (!recentCycles.length) {
      reply = "I don't have any cycles yet. Log a period start in Calendar to begin.";
    } else {
      const list = recentCycles.slice(0, 3).map((cycle, index) => {
        const start = new Date(cycle.startDate).toDateString();
        const end = cycle.endDate ? new Date(cycle.endDate).toDateString() : "End not set";
        return `${index + 1}) ${start} ? ${end}`;
      });
      reply = `Here are your last cycles:\n${list.join("\n")}`;
    }
  } else if (intent === "mood") {
    const topMoods = pickTopMoods(symptoms.map((item) => item.mood).filter(Boolean) as string[]);
    reply = topMoods.length
      ? `Your most common moods lately are: ${topMoods.join(", ")}.`
      : "Log symptoms to see mood trends and patterns.";
  } else if (intent === "wellness") {
    const topMoods = pickTopMoods(symptoms.map((item) => item.mood).filter(Boolean) as string[]);
    reply =
      "Supportive ideas: warm soups, ginger tea, dark chocolate, and leafy greens. " +
      (topMoods.length ? `Your common moods lately: ${topMoods.join(", ")}.` : "Log symptoms to see mood trends.");
  }

  reply = `${reply} ${classyClose()}`;

  await prisma.chatLog.createMany({
    data: [
      { userId, role: "USER", message },
      { userId, role: "ASSISTANT", message: reply },
    ],
  });

  return res.json({ reply });
});

router.get("/logs", requireAuth, async (req: AuthRequest, res) => {
  const cutoff = await purgeOldLogs(req.userId!);
  const logs = await prisma.chatLog.findMany({
    where: { userId: req.userId, createdAt: { gte: cutoff } },
    orderBy: { createdAt: "asc" },
  });
  return res.json({ logs });
});

export default router;
