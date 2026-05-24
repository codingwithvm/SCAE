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
import { GET, PATCH } from "@/app/api/v1/(protected)/gscae/profile/route";

const mockedUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockedUserUpdate = vi.mocked(prisma.user.update);
const mockedVerifyToken = vi.mocked(verifyToken);

const BASE_URL = "http://localhost:3000/api/v1/gscae/profile";

const studentTokenPayload = {
  userId: "550e8400-e29b-41d4-a716-446655440000",
  role: "STUDENT" as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400,
};

const adminTokenPayload = {
  ...studentTokenPayload,
  userId: "660e8400-e29b-41d4-a716-446655440001",
  role: "ADMIN" as const,
};

const teacherTokenPayload = {
  ...studentTokenPayload,
  userId: "770e8400-e29b-41d4-a716-446655440002",
  role: "TEACHER" as const,
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

describe("GET /api/v1/gscae/profile", () => {
  it("should return 401 without authentication", async () => {
    const request = createUnauthenticatedRequest("GET");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });

  it("should return null profile when user has no scaeProfile", async () => {
    mockedVerifyToken.mockReturnValue(studentTokenPayload);
    mockedUserFindUnique.mockResolvedValue({
      scaeProfile: null,
    } as never);

    const request = createAuthenticatedRequest("GET");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.scaeProfile).toBeNull();
    expect(data.profileDescription).toBeNull();
    expect(data.strategies).toEqual([]);
  });

  it("should return profile data with description and strategies", async () => {
    mockedVerifyToken.mockReturnValue(studentTokenPayload);
    mockedUserFindUnique.mockResolvedValue({
      scaeProfile: "Analítico",
    } as never);

    const request = createAuthenticatedRequest("GET");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.scaeProfile).toBe("Analítico");
    expect(data.profileDescription).toContain("teoria");
    expect(data.strategies).toHaveLength(4);
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

  it("should return all four profile types correctly", async () => {
    const profiles = ["Analítico", "Prático", "Criativo", "Estrategista"];

    for (const profile of profiles) {
      mockedVerifyToken.mockReturnValue(studentTokenPayload);
      mockedUserFindUnique.mockResolvedValue({
        scaeProfile: profile,
      } as never);

      const request = createAuthenticatedRequest("GET");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.scaeProfile).toBe(profile);
      expect(data.profileDescription).toBeTruthy();
      expect(data.strategies).toHaveLength(4);
    }
  });
});

describe("PATCH /api/v1/gscae/profile", () => {
  it("should return 401 without authentication", async () => {
    const request = createUnauthenticatedRequest("PATCH");

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });

  it("should return 400 when scaeProfile is missing", async () => {
    mockedVerifyToken.mockReturnValue(studentTokenPayload);

    const request = createAuthenticatedRequest("PATCH", {});
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("scaeProfile is required");
  });

  it("should return 400 for invalid scaeProfile value", async () => {
    mockedVerifyToken.mockReturnValue(studentTokenPayload);

    const request = createAuthenticatedRequest("PATCH", {
      scaeProfile: "InvalidProfile",
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Invalid scaeProfile");
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

  it("should update own profile successfully", async () => {
    mockedVerifyToken.mockReturnValue(studentTokenPayload);
    mockedUserUpdate.mockResolvedValue({
      id: studentTokenPayload.userId,
      name: "Student",
      scaeProfile: "Prático",
    } as never);

    const request = createAuthenticatedRequest("PATCH", {
      scaeProfile: "Prático",
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.scaeProfile).toBe("Prático");
    expect(data.profileDescription).toContain("fazendo");
    expect(data.strategies).toHaveLength(4);
    expect(data.userId).toBe(studentTokenPayload.userId);
  });

  it("should allow admin to update another user profile", async () => {
    const targetUserId = "880e8400-e29b-41d4-a716-446655440003";
    mockedVerifyToken.mockReturnValue(adminTokenPayload);
    mockedUserFindUnique.mockResolvedValue({
      id: targetUserId,
    } as never);
    mockedUserUpdate.mockResolvedValue({
      id: targetUserId,
      name: "Target Student",
      scaeProfile: "Criativo",
    } as never);

    const request = createAuthenticatedRequest("PATCH", {
      scaeProfile: "Criativo",
      userId: targetUserId,
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.scaeProfile).toBe("Criativo");
    expect(data.userId).toBe(targetUserId);
  });

  it("should return 403 when non-admin tries to update another user", async () => {
    const targetUserId = "880e8400-e29b-41d4-a716-446655440003";
    mockedVerifyToken.mockReturnValue(teacherTokenPayload);

    const request = createAuthenticatedRequest("PATCH", {
      scaeProfile: "Criativo",
      userId: targetUserId,
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return 404 when admin targets non-existent user", async () => {
    const targetUserId = "880e8400-e29b-41d4-a716-446655440003";
    mockedVerifyToken.mockReturnValue(adminTokenPayload);
    mockedUserFindUnique.mockResolvedValue(null);

    const request = createAuthenticatedRequest("PATCH", {
      scaeProfile: "Criativo",
      userId: targetUserId,
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Target user not found");
  });

  it("should accept all four valid profile values", async () => {
    const profiles = ["Analítico", "Prático", "Criativo", "Estrategista"];

    for (const profile of profiles) {
      mockedVerifyToken.mockReturnValue(studentTokenPayload);
      mockedUserUpdate.mockResolvedValue({
        id: studentTokenPayload.userId,
        name: "Student",
        scaeProfile: profile,
      } as never);

      const request = createAuthenticatedRequest("PATCH", {
        scaeProfile: profile,
      });
      const response = await PATCH(request);

      expect(response.status).toBe(200);
    }
  });
});
