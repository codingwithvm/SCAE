import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    assessmentRelease: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    assessment: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    assessmentResult: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { POST } from "@/app/api/v1/(protected)/assessments/route";

const mockedReleaseFindFirst = vi.mocked(prisma.assessmentRelease.findFirst);
const mockedTransaction = vi.mocked(prisma.$transaction);
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

const createdAssessment = {
  id: "asm00000-0000-0000-0000-000000000001",
  userId: studentTokenPayload.userId,
  instrument: "MCEES_1A4" as const,
  releaseId: existingRelease.id,
  state: "STARTED" as const,
  responsesJson: null,
  startedAt: new Date(),
  completedAt: null,
  totalTimeSeconds: null,
  ipAddress: null,
  userAgent: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("POST /api/v1/assessments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an assessment and transitions release to IN_USE", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedReleaseFindFirst.mockResolvedValueOnce(existingRelease);
    mockedTransaction.mockResolvedValueOnce(createdAssessment);

    const createRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments",
      { releaseId: existingRelease.id },
    );

    const createResponse = await POST(createRequest);
    const responseData = await createResponse.json();

    expect(createResponse.status).toBe(201);
    expect(responseData.id).toBe(createdAssessment.id);
    expect(responseData.instrument).toBe("MCEES_1A4");
    expect(responseData.state).toBe("STARTED");
  });

  it("returns 400 when releaseId is missing", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);

    const createRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments",
      {},
    );

    const createResponse = await POST(createRequest);
    const responseData = await createResponse.json();

    expect(createResponse.status).toBe(400);
    expect(responseData.error).toBeDefined();
  });

  it("returns 404 when release does not exist or is not PENDING", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedReleaseFindFirst.mockResolvedValueOnce(null);

    const createRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments",
      { releaseId: "nonexistent-release" },
    );

    const createResponse = await POST(createRequest);
    const responseData = await createResponse.json();

    expect(createResponse.status).toBe(404);
    expect(responseData.error).toBeDefined();
  });

  it("returns 403 when release belongs to another user", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    const otherUserRelease = {
      ...existingRelease,
      userId: "other-user-id",
    };
    mockedReleaseFindFirst.mockResolvedValueOnce(otherUserRelease);

    const createRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments",
      { releaseId: existingRelease.id },
    );

    const createResponse = await POST(createRequest);
    const responseData = await createResponse.json();

    expect(createResponse.status).toBe(403);
    expect(responseData.error).toBeDefined();
  });

  it("uses a transaction to create assessment and update release atomically", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedReleaseFindFirst.mockResolvedValueOnce(existingRelease);
    mockedTransaction.mockResolvedValueOnce(createdAssessment);

    const createRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments",
      { releaseId: existingRelease.id },
    );

    await POST(createRequest);

    expect(mockedTransaction).toHaveBeenCalledTimes(1);
  });

  it("returns 401 without authentication", async () => {
    const createRequest = createUnauthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments",
      { releaseId: existingRelease.id },
    );

    const createResponse = await POST(createRequest);

    expect(createResponse.status).toBe(401);
  });

  it("returns 403 for admin role", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const createRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/assessments",
      { releaseId: existingRelease.id },
    );

    const createResponse = await POST(createRequest);

    expect(createResponse.status).toBe(403);
  });
});
