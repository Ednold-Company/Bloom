import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "affbae923fc958d55c655b315aee9ba6aae16fd268db38063c296b95a772450c";

export function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
}

export async function getAuthUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      if (payload?.userId) {
        return payload.userId;
      }
    } catch {
      return null;
    }
  }

  return null;
}

