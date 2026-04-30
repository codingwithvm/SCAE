import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    assessmentRelease: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { DELETE } from "@/app/api/v1/(protected)/releases/[id]/route";

const mockedReleaseFindFirst = vi.mocked(prisma.assessmentRelease.findFirst);
const mockedReleaseUpdate = vi.mocked(prisma.assessmentRelease.update);
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

const releaseId = "rel00000-0000-0000-0000-000000000001";

const pendingRelease = {
  id: releaseId,
  userId: "880e8400-e29b-41d4-a716-446655440003",
  instrument: "MCEES_1A4" as const,
  releasedById: schoolManagerTokenPayload.userId,
  classId: "cls00000-0000-0000-0000-000000000001",
  state: "PENDING" as const,
  expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  consumedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const routeContext = {
  params: Promise.resolve({ id: releaseId }),
};

describe("DELETE /api/v1/releases/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revokes a PENDING release by setting state to EXPIRED", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedReleaseFindFirst.mockResolvedValueOnce(pendingRelease);
    const expiredRelease = { ...pendingRelease, state: "EXPIRED" as const };
    mockedReleaseUpdate.mockResolvedValueOnce(expiredRelease);

    const deleteRequest = createAuthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/releases/${releaseId}`,
    );

    const deleteResponse = await DELETE(deleteRequest, routeContext);
    const responseData = await deleteResponse.json();

    expect(deleteResponse.status).toBe(200);
    expect(responseData.message).toBe("Release revoked");
  });

  it("updates release state to EXPIRED", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedReleaseFindFirst.mockResolvedValueOnce(pendingRelease);
    mockedReleaseUpdate.mockResolvedValueOnce({
      ...pendingRelease,
      state: "EXPIRED" as const,
    });

    const deleteRequest = createAuthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/releases/${releaseId}`,
    );

    await DELETE(deleteRequest, routeContext);

    expect(mockedReleaseUpdate).toHaveBeenCalledWith({
      where: { id: releaseId },
      data: { state: "EXPIRED" },
    });
  });

  it("returns 404 when release does not exist", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedReleaseFindFirst.mockResolvedValueOnce(null);

    const deleteRequest = createAuthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/releases/${releaseId}`,
    );

    const deleteResponse = await DELETE(deleteRequest, routeContext);
    const responseData = await deleteResponse.json();

    expect(deleteResponse.status).toBe(404);
    expect(responseData.error).toBeDefined();
  });

  it("returns 409 when release is already consumed", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    const consumedRelease = {
      ...pendingRelease,
      state: "CONSUMED" as const,
      consumedAt: new Date(),
    };
    mockedReleaseFindFirst.mockResolvedValueOnce(consumedRelease);

    const deleteRequest = createAuthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/releases/${releaseId}`,
    );

    const deleteResponse = await DELETE(deleteRequest, routeContext);
    const responseData = await deleteResponse.json();

    expect(deleteResponse.status).toBe(409);
    expect(responseData.error).toBeDefined();
  });

  it("returns 401 without authentication", async () => {
    const deleteRequest = createUnauthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/releases/${releaseId}`,
    );

    const deleteResponse = await DELETE(deleteRequest, routeContext);

    expect(deleteResponse.status).toBe(401);
  });

  it("returns 403 for student role", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);

    const deleteRequest = createAuthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/releases/${releaseId}`,
    );

    const deleteResponse = await DELETE(deleteRequest, routeContext);

    expect(deleteResponse.status).toBe(403);
  });
});
