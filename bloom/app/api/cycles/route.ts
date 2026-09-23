import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/serverAuth";

const cycleSchema = z.object({
  startDate: z.string(),
  endDate: z.string().optional(),
});

function monthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, next };
}

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Missing or invalid auth token" }, { status: 401 });
  }

  const cycles = await prisma.cycle.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json({ cycles });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Missing or invalid auth token" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = cycleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { startDate, endDate } = parsed.data;
    const start = new Date(startDate);
    const range = monthRange(start);
    const existingInMonth = await prisma.cycle.findFirst({
      where: {
        userId,
        startDate: { gte: range.start, lt: range.next },
      },
    });
    if (existingInMonth) {
      return NextResponse.json(
        { error: "A period start is already logged for this month." },
        { status: 409 }
      );
    }

    const cycle = await prisma.cycle.create({
      data: {
        userId,
        startDate: start,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
    return NextResponse.json({ cycle }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

