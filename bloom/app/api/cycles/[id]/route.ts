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

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Missing or invalid auth token" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = cycleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.cycle.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
    }

    const start = new Date(parsed.data.startDate);
    const range = monthRange(start);
    const conflict = await prisma.cycle.findFirst({
      where: {
        userId,
        startDate: { gte: range.start, lt: range.next },
        NOT: { id: existing.id },
      },
    });
    if (conflict) {
      return NextResponse.json(
        { error: "A period start is already logged for this month." },
        { status: 409 }
      );
    }

    const cycle = await prisma.cycle.update({
      where: { id: existing.id },
      data: {
        startDate: start,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      },
    });

    return NextResponse.json({ cycle });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Missing or invalid auth token" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.cycle.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
    }

    await prisma.cycle.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

