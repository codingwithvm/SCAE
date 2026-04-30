import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    assessmentRelease: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { POST } from "@/app/api/v1/(protected)/assessments/verify/route";

const mockedReleaseFindFirst = vi.mocked(prisma.assessmentRelease.findFirst);
const mockedVerifyToken = vi.mocked(verifyToken);

function createAuthenticatedRequest(
  method: string,
  url: string,
  body?: Record<string, unknown>,
): Request {
  const requestOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid-token",
    },
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  return new Request(url, requestOptions);
}

function createUnauthenticatedRequest(
  method: string,
  url: string,
  body?: Record<string, unknown>,
): Request {
  const requestOptions: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  return new Request(url, requestOptions);
}

const studentTokenPayload = {
  userId: "550e8400-e29b-41d4-a716-446655440000",
  role: "STUDENT" as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400,
};

const teacherTokenPayload = {
  ...studentTokenPayload,
  userId: "660e8400-e29b-41d4-a716-446655440001",
  role: "TEACHER" as const,
};

const adminTokenPayload = {
  ...studentTokenPayload,
  userId: "770e8400-e29b-41d4-a716-446655440002",
  role: "ADMIN" as const,
};

const existingRelease = {
  id: "rel00000-0000-0000-0000-000000000001",
  userId: studentTokenPayload.userId,
  instrument: "MCEES_1A4" as const,
  releasedById: "880e8400-e29b-41d4-a716-446655440003",
  classId: "cls00000-0000-0000-0000-000000000001",
  state: "PENDING" as const,
  expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  consumedAt: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

describe("POST /api/v1/assessments/verify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with release data when student has active PENDING release", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedReleaseFindFirst.mockResolvedValueOnce(existingRelease);

    const verifyRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments/verify",
      { instrument: "MCEES_1A4" },
    );

    const verifyResponse = await POST(verifyRequest);
    const responseData = await verifyResponse.json();

    expect(verifyResponse.status).toBe(200);
    expect(responseData.releaseId).toBe(existingRelease.id);
    expect(responseData.instrument).toBe("MCEES_1A4");
    expect(responseData.allowed).toBe(true);
  });

  it("returns 200 with allowed false when no active release exists", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedReleaseFindFirst.mockResolvedValueOnce(null);

    const verifyRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments/verify",
      { instrument: "MCEES_1A4" },
    );

    const verifyResponse = await POST(verifyRequest);
    const responseData = await verifyResponse.json();

    expect(verifyResponse.status).toBe(200);
    expect(responseData.allowed).toBe(false);
    expect(responseData.releaseId).toBeUndefined();
  });

  it("returns 400 when instrument is missing", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);

    const verifyRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments/verify",
      {},
    );

    const verifyResponse = await POST(verifyRequest);
    const responseData = await verifyResponse.json();

    expect(verifyResponse.status).toBe(400);
    expect(responseData.error).toBeDefined();
  });

  it("returns 400 when instrument is invalid", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);

    const verifyRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments/verify",
      { instrument: "INVALID_INSTRUMENT" },
    );

    const verifyResponse = await POST(verifyRequest);
    const responseData = await verifyResponse.json();

    expect(verifyResponse.status).toBe(400);
    expect(responseData.error).toBeDefined();
  });

  it("filters out expired releases", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedReleaseFindFirst.mockResolvedValueOnce(null);

    const verifyRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments/verify",
      { instrument: "MCEES_1A4" },
    );

    await POST(verifyRequest);

    expect(mockedReleaseFindFirst).toHaveBeenCalledWith({
      where: {
        userId: studentTokenPayload.userId,
        instrument: "MCEES_1A4",
        state: "PENDING",
        OR: [{ expiresAt: null }, { expiresAt: { gt: expect.any(Date) } }],
      },
    });
  });

  it("allows teachers to verify releases", async () => {
    mockedVerifyToken.mockReturnValueOnce(teacherTokenPayload);
    const teacherRelease = {
      ...existingRelease,
      userId: teacherTokenPayload.userId,
      instrument: "MCEES_PROF" as const,
    };
    mockedReleaseFindFirst.mockResolvedValueOnce(teacherRelease);

    const verifyRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments/verify",
      { instrument: "MCEES_PROF" },
    );

    const verifyResponse = await POST(verifyRequest);
    const responseData = await verifyResponse.json();

    expect(verifyResponse.status).toBe(200);
    expect(responseData.allowed).toBe(true);
  });

  it("returns 401 without authentication", async () => {
    const verifyRequest = createUnauthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments/verify",
      { instrument: "MCEES_1A4" },
    );

    const verifyResponse = await POST(verifyRequest);
    const responseData = await verifyResponse.json();

    expect(verifyResponse.status).toBe(401);
    expect(responseData.error).toBe("Authentication required");
  });

  it("returns 403 for admin role", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const verifyRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments/verify",
      { instrument: "MCEES_1A4" },
    );

    const verifyResponse = await POST(verifyRequest);
    const responseData = await verifyResponse.json();

    expect(verifyResponse.status).toBe(403);
    expect(responseData.error).toBe("Forbidden");
  });
});
