import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    assessment: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { GET } from "@/app/api/v1/(protected)/assessments/[id]/report/route";

const mockedAssessmentFindFirst = vi.mocked(
  prisma.assessment.findFirst,
) as unknown as ReturnType<typeof vi.fn>;
const mockedVerifyToken = vi.mocked(verifyToken);

function createRequest(url: string): Request {
  return new Request(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid-token",
    },
  });
}

const studentPayload = {
  userId: "550e8400-e29b-41d4-a716-446655440000",
  role: "STUDENT" as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400,
};

const managerPayload = {
  ...studentPayload,
  userId: "660e8400-e29b-41d4-a716-446655440001",
  role: "SCHOOL_MANAGER" as const,
};

const assessmentId = "asm00000-0000-0000-0000-000000000001";
const routeContext = { params: Promise.resolve({ id: assessmentId }) };

const fullResult = {
  instrument: "mcees_1a4",
  dimensions: { CA: 10, EC: 6, EA: 14, OR: 8 },
  X: 6,
  Y: 4,
  confX: 75,
  confY: 50,
  profile: "Estrategista",
  tier: "CONFIRMED",
  extraAdj: null,
};

const completedAssessment = {
  id: assessmentId,
  userId: studentPayload.userId,
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
    axisX: 6,
    axisY: 4,
    confX: 75,
    confY: 50,
    tier: "CONFIRMED",
    scoresJson: { CA: 10, EC: 6, EA: 14, OR: 8 },
    fullResultJson: fullResult,
    engineVersion: "1.0.0",
    createdAt: new Date(),
  },
};

describe("GET /api/v1/assessments/:id/report", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without token", async () => {
    const req = new Request(
      `http://localhost:3000/api/v1/assessments/${assessmentId}/report`,
      { method: "GET" },
    );
    const res = await GET(req, routeContext);
    expect(res.status).toBe(401);
  });

  it("returns 404 when assessment not found", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentPayload);
    mockedAssessmentFindFirst.mockResolvedValueOnce(null);
    const req = createRequest(
      `http://localhost:3000/api/v1/assessments/${assessmentId}/report`,
    );
    const res = await GET(req, routeContext);
    expect(res.status).toBe(404);
  });

  it("returns 403 when user is not owner and not manager", async () => {
    const otherPayload = { ...studentPayload, userId: "other-user-id" };
    mockedVerifyToken.mockReturnValueOnce(otherPayload);
    mockedAssessmentFindFirst.mockResolvedValueOnce(completedAssessment);
    const req = createRequest(
      `http://localhost:3000/api/v1/assessments/${assessmentId}/report`,
    );
    const res = await GET(req, routeContext);
    expect(res.status).toBe(403);
  });

  it("returns 400 when assessment has no result", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentPayload);
    mockedAssessmentFindFirst.mockResolvedValueOnce({
      ...completedAssessment,
      result: null,
    });
    const req = createRequest(
      `http://localhost:3000/api/v1/assessments/${assessmentId}/report`,
    );
    const res = await GET(req, routeContext);
    expect(res.status).toBe(400);
  });

  it("returns full report for owner (student)", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentPayload);
    mockedAssessmentFindFirst.mockResolvedValueOnce(completedAssessment);
    const req = createRequest(
      `http://localhost:3000/api/v1/assessments/${assessmentId}/report`,
    );
    const res = await GET(req, routeContext);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.profile).toBe("Estrategista");
    expect(body.tier).toBe("CONFIRMED");
    expect(body.profileData).toBeDefined();
    expect(body.profileData.titulo).toBeDefined();
    expect(body.profileData.cor).toBeDefined();
    expect(body.profileData.fortes).toBeInstanceOf(Array);
    expect(body.profileData.desafios).toBeInstanceOf(Array);
    expect(body.gscae).toBeInstanceOf(Array);
    expect(body.gscae.length).toBe(4);
    expect(body.ludic).toBeDefined();
    expect(body.ludic.emoji).toBeDefined();
    expect(body.ludic.tag).toBeDefined();
  });

  it("includes axis data for manager", async () => {
    mockedVerifyToken.mockReturnValueOnce(managerPayload);
    mockedAssessmentFindFirst.mockResolvedValueOnce(completedAssessment);
    const req = createRequest(
      `http://localhost:3000/api/v1/assessments/${assessmentId}/report`,
    );
    const res = await GET(req, routeContext);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.axes).toBeDefined();
    expect(body.axes.x).toBe(6);
    expect(body.axes.y).toBe(4);
    expect(body.axes.confX).toBe(75);
    expect(body.axes.confY).toBe(50);
    expect(body.dimensions).toBeDefined();
  });

  it("does NOT include axis data for student owner", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentPayload);
    mockedAssessmentFindFirst.mockResolvedValueOnce(completedAssessment);
    const req = createRequest(
      `http://localhost:3000/api/v1/assessments/${assessmentId}/report`,
    );
    const res = await GET(req, routeContext);
    const body = await res.json();
    expect(body.axes).toBeUndefined();
    expect(body.dimensions).toBeUndefined();
  });

  it("returns teacher-specific fields for MEES instrument", async () => {
    const meesFullResult = {
      ...fullResult,
      instrument: "mees_prof",
      profile: "Facilitador",
    };
    const meesAssessment = {
      ...completedAssessment,
      instrument: "MEES_PROF",
      result: {
        ...completedAssessment.result,
        profile: "Facilitador",
        fullResultJson: meesFullResult,
      },
    };
    mockedVerifyToken.mockReturnValueOnce(managerPayload);
    mockedAssessmentFindFirst.mockResolvedValueOnce(meesAssessment);
    const req = createRequest(
      `http://localhost:3000/api/v1/assessments/${assessmentId}/report`,
    );
    const res = await GET(req, routeContext);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.profile).toBe("Facilitador");
    expect(body.profileData).toBeDefined();
    expect(body.gscae).toBeInstanceOf(Array);
  });
});
