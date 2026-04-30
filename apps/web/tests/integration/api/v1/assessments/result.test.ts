import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    assessment: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { POST } from "@/app/api/v1/(protected)/assessments/[id]/result/route";

const mockedAssessmentFindFirst = vi.mocked(prisma.assessment.findFirst);
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

const assessmentId = "asm00000-0000-0000-0000-000000000001";

const existingAssessment = {
  id: assessmentId,
  userId: studentTokenPayload.userId,
  instrument: "MCEES_1A4" as const,
  releaseId: "rel00000-0000-0000-0000-000000000001",
  state: "STARTED" as const,
  responsesJson: null,
  startedAt: new Date("2026-01-15T10:00:00Z"),
  completedAt: null,
  totalTimeSeconds: null,
  ipAddress: null,
  userAgent: null,
  createdAt: new Date("2026-01-15T10:00:00Z"),
  updatedAt: new Date("2026-01-15T10:00:00Z"),
  result: null,
};

const validResultPayload = {
  profile: "Estrategista",
  axisX: 6,
  axisY: 4,
  confX: 75,
  confY: 50,
  tier: "CONFIRMED",
  scoresJson: { CA: 10, EC: 6, EA: 14, OR: 8 },
  fullResultJson: {
    profile: "Estrategista",
    axisX: 6,
    axisY: 4,
    scores: { CA: 10, EC: 6, EA: 14, OR: 8 },
  },
  totalTimeSeconds: 420,
};

const createdResult = {
  id: "res00000-0000-0000-0000-000000000001",
  assessmentId,
  profile: "Estrategista",
  quadrant: 1,
  axisX: 6,
  axisY: 4,
  confX: 75,
  confY: 50,
  tier: "CONFIRMED",
  scoresJson: validResultPayload.scoresJson,
  fullResultJson: validResultPayload.fullResultJson,
  engineVersion: "1.0.0",
  createdAt: new Date(),
};

const routeContext = {
  params: Promise.resolve({ id: assessmentId }),
};

describe("POST /api/v1/assessments/:id/result", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits result, completes assessment and consumes release atomically", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedAssessmentFindFirst.mockResolvedValueOnce(existingAssessment);
    mockedTransaction.mockResolvedValueOnce(createdResult);

    const submitRequest = createAuthenticatedRequest(
      "POST",
      `http://localhost/api/v1/assessments/${assessmentId}/result`,
      validResultPayload,
    );

    const submitResponse = await POST(submitRequest, routeContext);
    const responseData = await submitResponse.json();

    expect(submitResponse.status).toBe(201);
    expect(responseData.id).toBe(createdResult.id);
    expect(responseData.profile).toBe("Estrategista");
    expect(responseData.assessmentId).toBe(assessmentId);
  });

  it("uses a transaction for atomicity", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedAssessmentFindFirst.mockResolvedValueOnce(existingAssessment);
    mockedTransaction.mockResolvedValueOnce(createdResult);

    const submitRequest = createAuthenticatedRequest(
      "POST",
      `http://localhost/api/v1/assessments/${assessmentId}/result`,
      validResultPayload,
    );

    await POST(submitRequest, routeContext);

    expect(mockedTransaction).toHaveBeenCalledTimes(1);
  });

  it("returns 404 when assessment does not exist", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedAssessmentFindFirst.mockResolvedValueOnce(null);

    const submitRequest = createAuthenticatedRequest(
      "POST",
      `http://localhost/api/v1/assessments/${assessmentId}/result`,
      validResultPayload,
    );

    const submitResponse = await POST(submitRequest, routeContext);
    const responseData = await submitResponse.json();

    expect(submitResponse.status).toBe(404);
    expect(responseData.error).toBeDefined();
  });

  it("returns 403 when assessment belongs to another user", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    const otherUserAssessment = {
      ...existingAssessment,
      userId: "other-user-id",
    };
    mockedAssessmentFindFirst.mockResolvedValueOnce(otherUserAssessment);

    const submitRequest = createAuthenticatedRequest(
      "POST",
      `http://localhost/api/v1/assessments/${assessmentId}/result`,
      validResultPayload,
    );

    const submitResponse = await POST(submitRequest, routeContext);
    const responseData = await submitResponse.json();

    expect(submitResponse.status).toBe(403);
    expect(responseData.error).toBeDefined();
  });

  it("returns 409 when assessment already has a result", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    const completedAssessment = {
      ...existingAssessment,
      state: "COMPLETE" as const,
      result: createdResult,
    };
    mockedAssessmentFindFirst.mockResolvedValueOnce(completedAssessment);

    const submitRequest = createAuthenticatedRequest(
      "POST",
      `http://localhost/api/v1/assessments/${assessmentId}/result`,
      validResultPayload,
    );

    const submitResponse = await POST(submitRequest, routeContext);
    const responseData = await submitResponse.json();

    expect(submitResponse.status).toBe(409);
    expect(responseData.error).toBeDefined();
  });

  it("returns 400 when required fields are missing", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedAssessmentFindFirst.mockResolvedValueOnce(existingAssessment);

    const submitRequest = createAuthenticatedRequest(
      "POST",
      `http://localhost/api/v1/assessments/${assessmentId}/result`,
      { profile: "Estrategista" },
    );

    const submitResponse = await POST(submitRequest, routeContext);
    const responseData = await submitResponse.json();

    expect(submitResponse.status).toBe(400);
    expect(responseData.error).toBeDefined();
  });

  it("returns 400 when tier is invalid", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedAssessmentFindFirst.mockResolvedValueOnce(existingAssessment);

    const submitRequest = createAuthenticatedRequest(
      "POST",
      `http://localhost/api/v1/assessments/${assessmentId}/result`,
      { ...validResultPayload, tier: "INVALID" },
    );

    const submitResponse = await POST(submitRequest, routeContext);
    const responseData = await submitResponse.json();

    expect(submitResponse.status).toBe(400);
    expect(responseData.error).toBeDefined();
  });

  it("returns 401 without authentication", async () => {
    const submitRequest = createUnauthenticatedRequest(
      "POST",
      `http://localhost/api/v1/assessments/${assessmentId}/result`,
      validResultPayload,
    );

    const submitResponse = await POST(submitRequest, routeContext);

    expect(submitResponse.status).toBe(401);
  });

  it("returns 403 for admin role", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const submitRequest = createAuthenticatedRequest(
      "POST",
      `http://localhost/api/v1/assessments/${assessmentId}/result`,
      validResultPayload,
    );

    const submitResponse = await POST(submitRequest, routeContext);

    expect(submitResponse.status).toBe(403);
  });
});
