import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    assessment: {
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
import { GET } from "@/app/api/v1/(protected)/assessments/history/route";

const mockedAssessmentFindMany = vi.mocked(prisma.assessment.findMany);
const mockedAssessmentCount = vi.mocked(prisma.assessment.count);
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

const adminTokenPayload = {
  ...studentTokenPayload,
  userId: "770e8400-e29b-41d4-a716-446655440002",
  role: "ADMIN" as const,
};

const assessmentHistory = [
  {
    id: "asm00000-0000-0000-0000-000000000001",
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
    result: { profile: "Estrategista", tier: "CONFIRMED" },
  },
  {
    id: "asm00000-0000-0000-0000-000000000002",
    userId: studentTokenPayload.userId,
    instrument: "MCEES_1A4" as const,
    releaseId: null,
    state: "ABANDONED" as const,
    responsesJson: null,
    startedAt: new Date("2025-06-10T08:00:00Z"),
    completedAt: null,
    totalTimeSeconds: null,
    ipAddress: null,
    userAgent: null,
    createdAt: new Date("2025-06-10T08:00:00Z"),
    updatedAt: new Date("2025-06-10T08:00:00Z"),
    result: null,
  },
];

describe("GET /api/v1/assessments/history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated history for authenticated user", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedAssessmentFindMany.mockResolvedValueOnce(assessmentHistory);
    mockedAssessmentCount.mockResolvedValueOnce(2);

    const historyRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/assessments/history",
    );

    const historyResponse = await GET(historyRequest);
    const responseData = await historyResponse.json();

    expect(historyResponse.status).toBe(200);
    expect(responseData.data).toHaveLength(2);
    expect(responseData.total).toBe(2);
    expect(responseData.page).toBe(1);
    expect(responseData.perPage).toBe(20);
  });

  it("filters by own userId only", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedAssessmentFindMany.mockResolvedValueOnce([]);
    mockedAssessmentCount.mockResolvedValueOnce(0);

    const historyRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/assessments/history",
    );

    await GET(historyRequest);

    expect(mockedAssessmentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: studentTokenPayload.userId,
        }),
      }),
    );
  });

  it("supports pagination", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedAssessmentFindMany.mockResolvedValueOnce([]);
    mockedAssessmentCount.mockResolvedValueOnce(50);

    const historyRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/assessments/history?page=3&perPage=5",
    );

    await GET(historyRequest);

    expect(mockedAssessmentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 5,
      }),
    );
  });

  it("filters by instrument query param", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);
    mockedAssessmentFindMany.mockResolvedValueOnce([]);
    mockedAssessmentCount.mockResolvedValueOnce(0);

    const historyRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/assessments/history?instrument=MCEES_1A4",
    );

    await GET(historyRequest);

    expect(mockedAssessmentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          instrument: "MCEES_1A4",
        }),
      }),
    );
  });

  it("returns 401 without authentication", async () => {
    const historyRequest = createUnauthenticatedRequest(
      "GET",
      "http://localhost/api/v1/assessments/history",
    );

    const historyResponse = await GET(historyRequest);

    expect(historyResponse.status).toBe(401);
  });

  it("returns 403 for admin role", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const historyRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/assessments/history",
    );

    const historyResponse = await GET(historyRequest);

    expect(historyResponse.status).toBe(403);
  });
});
