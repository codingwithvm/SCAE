import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    assessment: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { GET } from "@/app/api/v1/(protected)/assessments/[id]/route";

const mockedAssessmentFindFirst = vi.mocked(prisma.assessment.findFirst);
const mockedVerifyToken = vi.mocked(verifyToken);

function createAuthenticatedRequest(method: string, url: string): Request {
  return new Request(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid-token",
    },
  });
}

function createUnauthenticatedRequest(method: string, url: string): Request {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
  });
}

const studentTokenPayload = {
  userId: "550e8400-e29b-41d4-a716-446655440000",
  role: "STUDENT" as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400,
};

const schoolManagerTokenPayload = {
  ...studentTokenPayload,
  userId: "660e8400-e29b-41d4-a716-446655440001",
  role: "SCHOOL_MANAGER" as const,
};

const assessmentId = "asm00000-0000-0000-0000-000000000001";

const completedAssessment = {
  id: assessmentId,
  userId: studentTokenPayload.userId,
  instrument: "MCEES_1A4" as const,
  releaseId: "rel00000-0000-0000-0000-000000000001",
  state: "COMPLETE" as const,
  responsesJson: null,
  startedAt: new Date("2026-01-15T10:00:00Z"),
  completedAt: new Date("2026-01-15T10:30:00Z"),
  totalTimeSeconds: 1800,
  ipAddress: null,
  userAgent: null,
  createdAt: new Date("2026-01-15T10:00:00Z"),
  updatedAt: new Date("2026-01-15T10:30:00Z"),
  result: {
    id: "res00000-0000-0000-0000-000000000001",
    assessmentId,
    profile: "Estrategista",
    quadrant: 1,
    axisX: 6,
    axisY: 4,
    confX: 75,
    confY: 50,
    tier: "CONFIRMED",
    scoresJson: { CA: 10, EC: 6, EA: 14, OR: 8 },
    fullResultJson: {},
    engineVersion: "1.0.0",
    createdAt: new Date(),
  },
};

const routeContext = {
  params: Promise.resolve({ id: assessmentId }),
};

describe("GET /api/v1/assessments/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns assessment with result for own user", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedAssessmentFindFirst.mockResolvedValueOnce(completedAssessment);

    const getRequest = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/assessments/${assessmentId}`,
    );

    const getResponse = await GET(getRequest, routeContext);
    const responseData = await getResponse.json();

    expect(getResponse.status).toBe(200);
    expect(responseData.id).toBe(assessmentId);
    expect(responseData.result.profile).toBe("Estrategista");
  });

  it("allows school manager to view any assessment", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedAssessmentFindFirst.mockResolvedValueOnce(completedAssessment);

    const getRequest = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/assessments/${assessmentId}`,
    );

    const getResponse = await GET(getRequest, routeContext);

    expect(getResponse.status).toBe(200);
  });

  it("returns 404 when assessment does not exist", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedAssessmentFindFirst.mockResolvedValueOnce(null);

    const getRequest = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/assessments/${assessmentId}`,
    );

    const getResponse = await GET(getRequest, routeContext);
    const responseData = await getResponse.json();

    expect(getResponse.status).toBe(404);
    expect(responseData.error).toBeDefined();
  });

  it("returns 403 when student tries to view another users assessment", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    const otherUserAssessment = {
      ...completedAssessment,
      userId: "other-user-id",
    };
    mockedAssessmentFindFirst.mockResolvedValueOnce(otherUserAssessment);

    const getRequest = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/assessments/${assessmentId}`,
    );

    const getResponse = await GET(getRequest, routeContext);
    const responseData = await getResponse.json();

    expect(getResponse.status).toBe(403);
    expect(responseData.error).toBeDefined();
  });

  it("returns 401 without authentication", async () => {
    const getRequest = createUnauthenticatedRequest(
      "GET",
      `http://localhost/api/v1/assessments/${assessmentId}`,
    );

    const getResponse = await GET(getRequest, routeContext);

    expect(getResponse.status).toBe(401);
  });

  it("strips sensitive score data when student views own result", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedAssessmentFindFirst.mockResolvedValueOnce(completedAssessment);

    const getRequest = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/assessments/${assessmentId}`,
    );

    const getResponse = await GET(getRequest, routeContext);
    const responseData = await getResponse.json();

    expect(getResponse.status).toBe(200);
    expect(responseData.result.scoresJson).toBeUndefined();
    expect(responseData.result.axisX).toBeUndefined();
    expect(responseData.result.axisY).toBeUndefined();
    expect(responseData.result.confX).toBeUndefined();
    expect(responseData.result.confY).toBeUndefined();
    expect(responseData.result.fullResultJson).toBeUndefined();
    expect(responseData.result.profile).toBe("Estrategista");
    expect(responseData.result.tier).toBe("CONFIRMED");
  });

  it("includes full score data for school manager", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedAssessmentFindFirst.mockResolvedValueOnce(completedAssessment);

    const getRequest = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/assessments/${assessmentId}`,
    );

    const getResponse = await GET(getRequest, routeContext);
    const responseData = await getResponse.json();

    expect(getResponse.status).toBe(200);
    expect(responseData.result.axisX).toBe(6);
    expect(responseData.result.scoresJson).toBeDefined();
  });
});
