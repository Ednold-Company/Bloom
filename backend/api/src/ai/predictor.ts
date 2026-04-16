import { Cycle, Symptom } from "@prisma/client";

export type PredictionResult = {
  nextPeriodStart: Date;
  ovulationDate: Date;
  pmsStart: Date;
  averageCycleLength: number;
};

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function predictCycle(cycles: Cycle[]): PredictionResult | null {
  if (cycles.length < 2) {
    return null;
  }

  const sorted = [...cycles].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  const lengths: number[] = [];
  for (let i = 1; i < sorted.length; i += 1) {
    lengths.push(daysBetween(new Date(sorted[i - 1].startDate), new Date(sorted[i].startDate)));
  }

  const averageCycleLength = Math.round(
    lengths.reduce((sum, value) => sum + value, 0) / lengths.length
  );

  const lastStart = new Date(sorted[sorted.length - 1].startDate);
  const nextPeriodStart = new Date(lastStart);
  nextPeriodStart.setDate(nextPeriodStart.getDate() + averageCycleLength);

  const ovulationDate = new Date(nextPeriodStart);
  ovulationDate.setDate(ovulationDate.getDate() - 14);

  const pmsStart = new Date(nextPeriodStart);
  pmsStart.setDate(pmsStart.getDate() - 5);

  return { nextPeriodStart, ovulationDate, pmsStart, averageCycleLength };
}

export function predictSymptoms(symptoms: Symptom[]) {
  const counts: Record<string, number> = {};
  symptoms.forEach((symptom) => {
    if (symptom.mood) {
      counts[symptom.mood] = (counts[symptom.mood] || 0) + 1;
    }
  });

  const commonMood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  return { commonMood };
}
