import "server-only";

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import type { Role } from "@/generated/prisma/client";

interface SessionPayload {
  userId: string;
  role: Role;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  try {
    const decoded = verifyToken(token) as SessionPayload & {
      iat: number;
      exp: number;
    };
    return { userId: decoded.userId, role: decoded.role };
  } catch {
    return null;
  }
}
