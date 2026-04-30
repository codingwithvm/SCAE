import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    assessmentRelease: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { POST } from "@/app/api/v1/(protected)/assessments/verify/route";

const mockedReleaseFindMany = vi.mocked(prisma.assessmentRelease.findMany);
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

  it("returns allowed with release data when student has active PENDING release", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedReleaseFindMany.mockResolvedValueOnce([existingRelease]);

    const verifyRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments/verify",
      { instrument: "MCEES_1A4" },
    );

    const verifyResponse = await POST(verifyRequest);
    const responseData = await verifyResponse.json();

    expect(verifyResponse.status).toBe(200);
    expect(responseData.allowed).toBe(true);
    expect(responseData.releaseId).toBe(existingRelease.id);
    expect(responseData.instrument).toBe("MCEES_1A4");
    expect(responseData.releases).toHaveLength(1);
  });

  it("returns allowed false when no active release exists", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedReleaseFindMany.mockResolvedValueOnce([]);

    const verifyRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments/verify",
      { instrument: "MCEES_1A4" },
    );

    const verifyResponse = await POST(verifyRequest);
    const responseData = await verifyResponse.json();

    expect(verifyResponse.status).toBe(200);
    expect(responseData.allowed).toBe(false);
    expect(responseData.releases).toEqual([]);
  });

  it("returns all pending releases when instrument is omitted", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    const secondRelease = {
      ...existingRelease,
      id: "rel00000-0000-0000-0000-000000000002",
      instrument: "MCEES_5A9" as const,
    };
    mockedReleaseFindMany.mockResolvedValueOnce([
      existingRelease,
      secondRelease,
    ]);

    const verifyRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments/verify",
      {},
    );

    const verifyResponse = await POST(verifyRequest);
    const responseData = await verifyResponse.json();

    expect(verifyResponse.status).toBe(200);
    expect(responseData.allowed).toBe(true);
    expect(responseData.releases).toHaveLength(2);
    expect(responseData.releaseId).toBe(existingRelease.id);
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

  it("filters by instrument when provided", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedReleaseFindMany.mockResolvedValueOnce([]);

    const verifyRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments/verify",
      { instrument: "MCEES_1A4" },
    );

    await POST(verifyRequest);

    expect(mockedReleaseFindMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        userId: studentTokenPayload.userId,
        instrument: "MCEES_1A4",
        state: "PENDING",
      }),
      orderBy: { createdAt: "asc" },
    });
  });

  it("does not filter by instrument when omitted", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedReleaseFindMany.mockResolvedValueOnce([]);

    const verifyRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments/verify",
      {},
    );

    await POST(verifyRequest);

    const callArgs = mockedReleaseFindMany.mock.calls[0][0];
    const whereClause = callArgs?.where as Record<string, unknown>;
    expect(whereClause.instrument).toBeUndefined();
  });

  it("allows teachers to verify releases", async () => {
    mockedVerifyToken.mockReturnValueOnce(teacherTokenPayload);
    const teacherRelease = {
      ...existingRelease,
      userId: teacherTokenPayload.userId,
      instrument: "MCEES_PROF" as const,
    };
    mockedReleaseFindMany.mockResolvedValueOnce([teacherRelease]);

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
