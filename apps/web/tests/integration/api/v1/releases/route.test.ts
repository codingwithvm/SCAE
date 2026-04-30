import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    assessmentRelease: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    assessment: {
      findFirst: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
    class: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { POST } from "@/app/api/v1/(protected)/releases/route";

const mockedReleaseFindFirst = vi.mocked(prisma.assessmentRelease.findFirst);
const mockedReleaseCreate = vi.mocked(prisma.assessmentRelease.create);
const mockedAssessmentFindFirst = vi.mocked(prisma.assessment.findFirst);
const mockedUserFindFirst = vi.mocked(prisma.user.findFirst);
const mockedClassFindFirst = vi.mocked(prisma.class.findFirst);
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

const schoolManagerTokenPayload = {
  userId: "660e8400-e29b-41d4-a716-446655440001",
  role: "SCHOOL_MANAGER" as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400,
};

const adminTokenPayload = {
  ...schoolManagerTokenPayload,
  userId: "770e8400-e29b-41d4-a716-446655440002",
  role: "ADMIN" as const,
};

const studentTokenPayload = {
  ...schoolManagerTokenPayload,
  userId: "550e8400-e29b-41d4-a716-446655440000",
  role: "STUDENT" as const,
};

const targetUserId = "880e8400-e29b-41d4-a716-446655440003";
const classId = "cls00000-0000-0000-0000-000000000001";

const existingUser = {
  id: targetUserId,
  role: "STUDENT" as const,
  name: "Aluno Teste",
  email: null,
  registrationNumber: "2026001",
  birthDate: new Date("2015-03-10"),
  passwordHash: null,
  schoolId: "sch00000-0000-0000-0000-000000000001",
  municipalityId: "mun00000-0000-0000-0000-000000000001",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  deletedAt: null,
};

const existingClass = {
  id: classId,
  schoolId: "sch00000-0000-0000-0000-000000000001",
  name: "1º Ano A",
  grade: 1,
  year: 2026,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  deletedAt: null,
};

const createdRelease = {
  id: "rel00000-0000-0000-0000-000000000001",
  userId: targetUserId,
  instrument: "MCEES_1A4" as const,
  releasedById: schoolManagerTokenPayload.userId,
  classId,
  state: "PENDING" as const,
  expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  consumedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const validCreateBody = {
  userId: targetUserId,
  instrument: "MCEES_1A4",
  classId,
};

describe("POST /api/v1/releases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a release and returns 201", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedUserFindFirst.mockResolvedValueOnce(existingUser);
    mockedClassFindFirst.mockResolvedValueOnce(existingClass);
    mockedReleaseFindFirst.mockResolvedValueOnce(null);
    mockedAssessmentFindFirst.mockResolvedValueOnce(null);
    mockedReleaseCreate.mockResolvedValueOnce(createdRelease);

    const createRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/releases",
      validCreateBody,
    );

    const createResponse = await POST(createRequest);
    const responseData = await createResponse.json();

    expect(createResponse.status).toBe(201);
    expect(responseData.id).toBe(createdRelease.id);
    expect(responseData.instrument).toBe("MCEES_1A4");
    expect(responseData.state).toBe("PENDING");
  });

  it("returns 400 when userId is missing", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);

    const createRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/releases",
      { instrument: "MCEES_1A4", classId },
    );

    const createResponse = await POST(createRequest);
    const responseData = await createResponse.json();

    expect(createResponse.status).toBe(400);
    expect(responseData.error).toBeDefined();
  });

  it("returns 400 when instrument is missing", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);

    const createRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/releases",
      { userId: targetUserId, classId },
    );

    const createResponse = await POST(createRequest);
    const responseData = await createResponse.json();

    expect(createResponse.status).toBe(400);
    expect(responseData.error).toBeDefined();
  });

  it("returns 400 when instrument is invalid", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);

    const createRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/releases",
      { userId: targetUserId, instrument: "INVALID", classId },
    );

    const createResponse = await POST(createRequest);
    const responseData = await createResponse.json();

    expect(createResponse.status).toBe(400);
    expect(responseData.error).toBeDefined();
  });

  it("returns 404 when target user does not exist", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedUserFindFirst.mockResolvedValueOnce(null);

    const createRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/releases",
      validCreateBody,
    );

    const createResponse = await POST(createRequest);
    const responseData = await createResponse.json();

    expect(createResponse.status).toBe(404);
    expect(responseData.error).toBeDefined();
  });

  it("returns 409 when user already has an active release for same instrument", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedUserFindFirst.mockResolvedValueOnce(existingUser);
    mockedClassFindFirst.mockResolvedValueOnce(existingClass);
    mockedReleaseFindFirst.mockResolvedValueOnce(createdRelease);

    const createRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/releases",
      validCreateBody,
    );

    const createResponse = await POST(createRequest);
    const responseData = await createResponse.json();

    expect(createResponse.status).toBe(409);
    expect(responseData.error).toContain("active release");
  });

  it("returns 409 when 6-month rule is violated", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedUserFindFirst.mockResolvedValueOnce(existingUser);
    mockedClassFindFirst.mockResolvedValueOnce(existingClass);
    mockedReleaseFindFirst.mockResolvedValueOnce(null);

    const recentAssessment = {
      id: "asm00000-0000-0000-0000-000000000001",
      userId: targetUserId,
      instrument: "MCEES_1A4" as const,
      releaseId: null,
      state: "COMPLETE" as const,
      responsesJson: null,
      startedAt: new Date(),
      completedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      totalTimeSeconds: 600,
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockedAssessmentFindFirst.mockResolvedValueOnce(recentAssessment);

    const createRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/releases",
      validCreateBody,
    );

    const createResponse = await POST(createRequest);
    const responseData = await createResponse.json();

    expect(createResponse.status).toBe(409);
    expect(responseData.error).toContain("6 months");
  });

  it("allows release when last assessment was more than 6 months ago", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedUserFindFirst.mockResolvedValueOnce(existingUser);
    mockedClassFindFirst.mockResolvedValueOnce(existingClass);
    mockedReleaseFindFirst.mockResolvedValueOnce(null);

    const oldAssessment = {
      id: "asm00000-0000-0000-0000-000000000001",
      userId: targetUserId,
      instrument: "MCEES_1A4" as const,
      releaseId: null,
      state: "COMPLETE" as const,
      responsesJson: null,
      startedAt: new Date(),
      completedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
      totalTimeSeconds: 600,
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockedAssessmentFindFirst.mockResolvedValueOnce(oldAssessment);
    mockedReleaseCreate.mockResolvedValueOnce(createdRelease);

    const createRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/releases",
      validCreateBody,
    );

    const createResponse = await POST(createRequest);

    expect(createResponse.status).toBe(201);
  });

  it("allows admin to create releases", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedUserFindFirst.mockResolvedValueOnce(existingUser);
    mockedClassFindFirst.mockResolvedValueOnce(existingClass);
    mockedReleaseFindFirst.mockResolvedValueOnce(null);
    mockedAssessmentFindFirst.mockResolvedValueOnce(null);
    mockedReleaseCreate.mockResolvedValueOnce({
      ...createdRelease,
      releasedById: adminTokenPayload.userId,
    });

    const createRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/releases",
      validCreateBody,
    );

    const createResponse = await POST(createRequest);

    expect(createResponse.status).toBe(201);
  });

  it("returns 401 without authentication", async () => {
    const createRequest = createUnauthenticatedRequest(
      "POST",
      "http://localhost/api/v1/releases",
      validCreateBody,
    );

    const createResponse = await POST(createRequest);

    expect(createResponse.status).toBe(401);
  });

  it("returns 403 for student role", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);

    const createRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/releases",
      validCreateBody,
    );

    const createResponse = await POST(createRequest);

    expect(createResponse.status).toBe(403);
  });
});
