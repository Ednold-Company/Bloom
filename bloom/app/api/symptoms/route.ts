import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/serverAuth";

const symptomSchema = z.object({
  date: z.string(),
  mood: z.string().optional(),
  cramps: z.number().min(1).max(5).optional(),
  sleep: z.number().min(1).max(5).optional(),
  energy: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Missing or invalid auth token" }, { status: 401 });
  }

  const symptoms = await prisma.symptom.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
  return NextResponse.json({ symptoms });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Missing or invalid auth token" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = symptomSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const symptom = await prisma.symptom.create({
      data: {
        userId,
        date: new Date(parsed.data.date),
        mood: parsed.data.mood,
        cramps: parsed.data.cramps,
        sleep: parsed.data.sleep,
        energy: parsed.data.energy,
        notes: parsed.data.notes,
      },
    });

    return NextResponse.json({ symptom }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

