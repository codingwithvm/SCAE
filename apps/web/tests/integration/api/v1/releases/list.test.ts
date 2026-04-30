import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    assessmentRelease: {
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
import { GET } from "@/app/api/v1/(protected)/releases/route";

const mockedReleaseFindMany = vi.mocked(prisma.assessmentRelease.findMany);
const mockedReleaseCount = vi.mocked(prisma.assessmentRelease.count);
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

const schoolManagerTokenPayload = {
  userId: "660e8400-e29b-41d4-a716-446655440001",
  role: "SCHOOL_MANAGER" as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400,
};

const studentTokenPayload = {
  ...schoolManagerTokenPayload,
  userId: "550e8400-e29b-41d4-a716-446655440000",
  role: "STUDENT" as const,
};

const classId = "cls00000-0000-0000-0000-000000000001";

const releasesList = [
  {
    id: "rel00000-0000-0000-0000-000000000001",
    userId: "880e8400-e29b-41d4-a716-446655440003",
    instrument: "MCEES_1A4" as const,
    releasedById: schoolManagerTokenPayload.userId,
    classId,
    state: "PENDING" as const,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    consumedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "rel00000-0000-0000-0000-000000000002",
    userId: "990e8400-e29b-41d4-a716-446655440004",
    instrument: "MCEES_1A4" as const,
    releasedById: schoolManagerTokenPayload.userId,
    classId,
    state: "CONSUMED" as const,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    consumedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("GET /api/v1/releases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated list of releases", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedReleaseFindMany.mockResolvedValueOnce(releasesList);
    mockedReleaseCount.mockResolvedValueOnce(2);

    const listRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/releases",
    );

    const listResponse = await GET(listRequest);
    const responseData = await listResponse.json();

    expect(listResponse.status).toBe(200);
    expect(responseData.data).toHaveLength(2);
    expect(responseData.total).toBe(2);
    expect(responseData.page).toBe(1);
    expect(responseData.perPage).toBe(20);
  });

  it("filters by classId", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedReleaseFindMany.mockResolvedValueOnce([releasesList[0]]);
    mockedReleaseCount.mockResolvedValueOnce(1);

    const listRequest = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/releases?classId=${classId}`,
    );

    await GET(listRequest);

    expect(mockedReleaseFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ classId }),
      }),
    );
  });

  it("filters by state", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedReleaseFindMany.mockResolvedValueOnce([releasesList[0]]);
    mockedReleaseCount.mockResolvedValueOnce(1);

    const listRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/releases?state=PENDING",
    );

    await GET(listRequest);

    expect(mockedReleaseFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ state: "PENDING" }),
      }),
    );
  });

  it("filters by instrument", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedReleaseFindMany.mockResolvedValueOnce([]);
    mockedReleaseCount.mockResolvedValueOnce(0);

    const listRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/releases?instrument=MCEES_PROF",
    );

    await GET(listRequest);

    expect(mockedReleaseFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ instrument: "MCEES_PROF" }),
      }),
    );
  });

  it("supports pagination", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedReleaseFindMany.mockResolvedValueOnce([]);
    mockedReleaseCount.mockResolvedValueOnce(50);

    const listRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/releases?page=2&perPage=10",
    );

    await GET(listRequest);

    expect(mockedReleaseFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
  });

  it("returns 401 without authentication", async () => {
    const listRequest = createUnauthenticatedRequest(
      "GET",
      "http://localhost/api/v1/releases",
    );

    const listResponse = await GET(listRequest);

    expect(listResponse.status).toBe(401);
  });

  it("returns 403 for student role", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);

    const listRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/releases",
    );

    const listResponse = await GET(listRequest);

    expect(listResponse.status).toBe(403);
  });
});
