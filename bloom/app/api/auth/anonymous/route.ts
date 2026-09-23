import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/serverAuth";

function sanitizeUser(user: { passwordHash?: string | null } & Record<string, any>) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function POST() {
  try {
    const user = await prisma.user.create({
      data: { isAnonymous: true },
    });

    const token = signToken(user.id);
    return NextResponse.json({ token, user: sanitizeUser(user) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

