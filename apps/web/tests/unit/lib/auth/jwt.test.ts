import { describe, it, expect, vi } from "vitest";
import {
  generateToken,
  verifyToken,
  TOKEN_EXPIRATION_BY_ROLE,
} from "@/lib/auth/jwt";

const mockUserId = "550e8400-e29b-41d4-a716-446655440000";

describe("TOKEN_EXPIRATION_BY_ROLE", () => {
  it("defines expiration of 8h for STUDENT", () => {
    expect(TOKEN_EXPIRATION_BY_ROLE.STUDENT).toBe("8h");
  });

  it("defines expiration of 24h for TEACHER", () => {
    expect(TOKEN_EXPIRATION_BY_ROLE.TEACHER).toBe("24h");
  });

  it("defines expiration of 24h for SCHOOL_MANAGER", () => {
    expect(TOKEN_EXPIRATION_BY_ROLE.SCHOOL_MANAGER).toBe("24h");
  });

  it("defines expiration of 24h for MUNICIPAL_MANAGER", () => {
    expect(TOKEN_EXPIRATION_BY_ROLE.MUNICIPAL_MANAGER).toBe("24h");
  });

  it("defines expiration of 8h for ADMIN", () => {
    expect(TOKEN_EXPIRATION_BY_ROLE.ADMIN).toBe("8h");
  });
});

describe("generateToken", () => {
  it("returns a signed JWT string", () => {
    const token = generateToken({ userId: mockUserId, role: "TEACHER" });

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("generates different tokens for different users", () => {
    const tokenA = generateToken({ userId: mockUserId, role: "TEACHER" });
    const tokenB = generateToken({
      userId: "660e8400-e29b-41d4-a716-446655440001",
      role: "TEACHER",
    });

    expect(tokenA).not.toBe(tokenB);
  });

  it("generates different tokens for different roles", () => {
    const tokenTeacher = generateToken({
      userId: mockUserId,
      role: "TEACHER",
    });
    const tokenStudent = generateToken({
      userId: mockUserId,
      role: "STUDENT",
    });

    expect(tokenTeacher).not.toBe(tokenStudent);
  });
});

describe("verifyToken", () => {
  it("returns the decoded payload with userId and role", () => {
    const token = generateToken({ userId: mockUserId, role: "TEACHER" });

    const decoded = verifyToken(token);

    expect(decoded.userId).toBe(mockUserId);
    expect(decoded.role).toBe("TEACHER");
  });

  it("throws an error for an invalid token", () => {
    expect(() => verifyToken("invalid.token.string")).toThrow();
  });

  it("throws an error for a tampered token", () => {
    const token = generateToken({ userId: mockUserId, role: "TEACHER" });
    const tamperedToken = token.slice(0, -5) + "XXXXX";

    expect(() => verifyToken(tamperedToken)).toThrow();
  });

  it("throws an error for an expired token", () => {
    vi.useFakeTimers();

    const token = generateToken({ userId: mockUserId, role: "STUDENT" });

    vi.advanceTimersByTime(9 * 60 * 60 * 1000);

    expect(() => verifyToken(token)).toThrow();

    vi.useRealTimers();
  });

  it("does not include sensitive data like passwordHash in the payload", () => {
    const token = generateToken({ userId: mockUserId, role: "ADMIN" });

    const decoded = verifyToken(token);
    const decodedAsRecord = decoded as unknown as Record<string, unknown>;

    expect(decodedAsRecord.passwordHash).toBeUndefined();
    expect(decodedAsRecord.password).toBeUndefined();
    expect(decodedAsRecord.email).toBeUndefined();
  });
});
