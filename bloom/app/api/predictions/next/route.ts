import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/serverAuth";
import { predictCycle, predictSymptoms } from "@/lib/predictor";

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Missing or invalid auth token" }, { status: 401 });
  }

  const cycles = await prisma.cycle.findMany({ where: { userId } });
  const symptoms = await prisma.symptom.findMany({ where: { userId } });

  const cyclePrediction = predictCycle(cycles);
  const symptomPrediction = predictSymptoms(symptoms);

  return NextResponse.json({
    cyclePrediction,
    symptomPrediction,
  });
}

