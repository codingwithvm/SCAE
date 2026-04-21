import jwt, { type SignOptions } from "jsonwebtoken";
import type { Role } from "@/generated/prisma/client";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

export const TOKEN_EXPIRATION_BY_ROLE: Record<Role, SignOptions["expiresIn"]> =
  {
    STUDENT: "8h",
    TEACHER: "24h",
    SCHOOL_MANAGER: "24h",
    MUNICIPAL_MANAGER: "24h",
    ADMIN: "8h",
  };

interface TokenPayload {
  userId: string;
  role: Role;
}

interface DecodedTokenPayload extends TokenPayload {
  iat: number;
  exp: number;
}

export function generateToken(payload: TokenPayload): string {
  const expiresIn = TOKEN_EXPIRATION_BY_ROLE[payload.role];

  return jwt.sign(
    { userId: payload.userId, role: payload.role },
    JWT_SECRET as string,
    { expiresIn },
  );
}

export function verifyToken(token: string): DecodedTokenPayload {
  return jwt.verify(token, JWT_SECRET as string) as DecodedTokenPayload;
}
