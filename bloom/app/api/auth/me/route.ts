import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/serverAuth";

function sanitizeUser(user: { passwordHash?: string | null } & Record<string, any>) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Missing or invalid auth token" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return NextResponse.json({ user: user ? sanitizeUser(user) : null });
}

