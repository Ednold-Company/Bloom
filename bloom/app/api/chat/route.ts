import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/serverAuth";
import { generateAssistantReply, purgeOldLogs } from "@/lib/chatLogic";

const chatSchema = z.object({ message: z.string().min(1) });

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Missing or invalid auth token" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await purgeOldLogs(userId);
    const message = parsed.data.message;

    const [cycles, symptoms] = await Promise.all([
      prisma.cycle.findMany({ where: { userId }, orderBy: { startDate: "asc" } }),
      prisma.symptom.findMany({ where: { userId }, orderBy: { date: "desc" } }),
    ]);

    const reply = generateAssistantReply(message, cycles, symptoms);

    await prisma.chatLog.createMany({
      data: [
        { userId, role: "USER", message },
        { userId, role: "ASSISTANT", message: reply },
      ],
    });

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
