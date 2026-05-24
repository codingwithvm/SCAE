import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { GET, PATCH } from "@/app/api/v1/(protected)/gscae/onboarding/route";

const mockedUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockedUserUpdate = vi.mocked(prisma.user.update);
const mockedVerifyToken = vi.mocked(verifyToken);

const BASE_URL = "http://localhost:3000/api/v1/gscae/onboarding";

const studentTokenPayload = {
  userId: "550e8400-e29b-41d4-a716-446655440000",
  role: "STUDENT" as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400,
};

function createAuthenticatedRequest(
  method: string,
  body?: Record<string, unknown>,
): Request {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid-token",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return new Request(BASE_URL, options);
}

function createUnauthenticatedRequest(method: string): Request {
  return new Request(BASE_URL, {
    method,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/v1/gscae/onboarding", () => {
  it("should return 401 without authentication", async () => {
    const request = createUnauthenticatedRequest("GET");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });

  it("should return onboarding status for user with no profile", async () => {
    mockedVerifyToken.mockReturnValue(studentTokenPayload);
    mockedUserFindUnique.mockResolvedValue({
      onboardingCompleted: false,
      onboardingCompletedAt: null,
      scaeProfile: null,
      mceUnlocked: false,
    } as never);

    const request = createAuthenticatedRequest("GET");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.onboardingCompleted).toBe(false);
    expect(data.onboardingCompletedAt).toBeNull();
    expect(data.scaeProfile).toBeNull();
    expect(data.mceUnlocked).toBe(false);
    expect(data.pendingSteps).toContain("select_profile");
    expect(data.pendingSteps).toContain("complete_onboarding");
  });

  it("should return completed onboarding with no pending steps", async () => {
    const completedAt = new Date().toISOString();
    mockedVerifyToken.mockReturnValue(studentTokenPayload);
    mockedUserFindUnique.mockResolvedValue({
      onboardingCompleted: true,
      onboardingCompletedAt: completedAt,
      scaeProfile: "Analítico",
      mceUnlocked: false,
    } as never);

    const request = createAuthenticatedRequest("GET");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.onboardingCompleted).toBe(true);
    expect(data.pendingSteps).toEqual([]);
  });

  it("should return 404 when user is not found", async () => {
    mockedVerifyToken.mockReturnValue(studentTokenPayload);
    mockedUserFindUnique.mockResolvedValue(null);

    const request = createAuthenticatedRequest("GET");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("User not found");
  });

  it("should show only complete_onboarding when profile is set but not completed", async () => {
    mockedVerifyToken.mockReturnValue(studentTokenPayload);
    mockedUserFindUnique.mockResolvedValue({
      onboardingCompleted: false,
      onboardingCompletedAt: null,
      scaeProfile: "Prático",
      mceUnlocked: false,
    } as never);

    const request = createAuthenticatedRequest("GET");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pendingSteps).toEqual(["complete_onboarding"]);
  });
});

describe("PATCH /api/v1/gscae/onboarding", () => {
  it("should return 401 without authentication", async () => {
    const request = createUnauthenticatedRequest("PATCH");

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });

  it("should return 400 when onboardingCompleted is missing", async () => {
    mockedVerifyToken.mockReturnValue(studentTokenPayload);

    const request = createAuthenticatedRequest("PATCH", {});
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("onboardingCompleted");
  });

  it("should return 400 when onboardingCompleted is not boolean", async () => {
    mockedVerifyToken.mockReturnValue(studentTokenPayload);

    const request = createAuthenticatedRequest("PATCH", {
      onboardingCompleted: "true",
    });
    const response = await PATCH(request);
    await response.json();

    expect(response.status).toBe(400);
  });

  it("should return 400 for invalid JSON body", async () => {
    mockedVerifyToken.mockReturnValue(studentTokenPayload);

    const request = new Request(BASE_URL, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer valid-token",
      },
      body: "not-json",
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid body");
  });

  it("should return 422 when completing onboarding without profile", async () => {
    mockedVerifyToken.mockReturnValue(studentTokenPayload);
    mockedUserFindUnique.mockResolvedValue({
      onboardingCompleted: false,
      scaeProfile: null,
    } as never);

    const request = createAuthenticatedRequest("PATCH", {
      onboardingCompleted: true,
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toContain("scaeProfile");
  });

  it("should return 409 when onboarding is already completed", async () => {
    mockedVerifyToken.mockReturnValue(studentTokenPayload);
    mockedUserFindUnique.mockResolvedValue({
      onboardingCompleted: true,
      scaeProfile: "Analítico",
    } as never);

    const request = createAuthenticatedRequest("PATCH", {
      onboardingCompleted: true,
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toContain("already completed");
  });

  it("should complete onboarding successfully", async () => {
    mockedVerifyToken.mockReturnValue(studentTokenPayload);
    mockedUserFindUnique.mockResolvedValue({
      onboardingCompleted: false,
      scaeProfile: "Estrategista",
    } as never);

    const completedAt = new Date();
    mockedUserUpdate.mockResolvedValue({
      onboardingCompleted: true,
      onboardingCompletedAt: completedAt,
      scaeProfile: "Estrategista",
      mceUnlocked: false,
    } as never);

    const request = createAuthenticatedRequest("PATCH", {
      onboardingCompleted: true,
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.onboardingCompleted).toBe(true);
    expect(data.onboardingCompletedAt).toBeTruthy();
    expect(data.pendingSteps).toEqual([]);

    expect(mockedUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: studentTokenPayload.userId },
        data: expect.objectContaining({
          onboardingCompleted: true,
          onboardingCompletedAt: expect.any(Date),
        }),
      }),
    );
  });

  it("should reset onboarding when setting to false", async () => {
    mockedVerifyToken.mockReturnValue(studentTokenPayload);
    mockedUserFindUnique.mockResolvedValue({
      onboardingCompleted: false,
      scaeProfile: "Prático",
    } as never);
    mockedUserUpdate.mockResolvedValue({
      onboardingCompleted: false,
      onboardingCompletedAt: null,
      scaeProfile: "Prático",
      mceUnlocked: false,
    } as never);

    const request = createAuthenticatedRequest("PATCH", {
      onboardingCompleted: false,
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.onboardingCompleted).toBe(false);
    expect(data.onboardingCompletedAt).toBeNull();

    expect(mockedUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          onboardingCompleted: false,
          onboardingCompletedAt: null,
        }),
      }),
    );
  });

  it("should return 404 when user is not found", async () => {
    mockedVerifyToken.mockReturnValue(studentTokenPayload);
    mockedUserFindUnique.mockResolvedValue(null);

    const request = createAuthenticatedRequest("PATCH", {
      onboardingCompleted: true,
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("User not found");
  });
});
