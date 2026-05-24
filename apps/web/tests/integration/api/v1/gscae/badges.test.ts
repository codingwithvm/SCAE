import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    badge: {
      findMany: vi.fn(),
    },
    studentBadge: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { GET } from "@/app/api/v1/(protected)/gscae/badges/route";

const mockedBadgeFindMany = vi.mocked(prisma.badge.findMany);
const mockedStudentBadgeFindMany = vi.mocked(prisma.studentBadge.findMany);
const mockedVerifyToken = vi.mocked(verifyToken);

const BASE_URL = "http://localhost:3000/api/v1/gscae/badges";

const studentPayload = {
  userId: "550e8400-e29b-41d4-a716-446655440000",
  role: "STUDENT" as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400,
};

const otherStudentPayload = {
  ...studentPayload,
  userId: "660e8400-e29b-41d4-a716-446655440001",
};

function authRequest(): Request {
  return new Request(BASE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid-token",
    },
  });
}

function unauthRequest(): Request {
  return new Request(BASE_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

const sampleBadges = [
  {
    id: "scae_conhece",
    name: "Explorador",
    description: "Atingiu o nível CONHECE em uma habilidade",
    category: "scae_level",
    icon: "Star",
    color: "bg-red-100 text-red-700",
    criteria: { scaeLevel: "CONHECE" },
  },
  {
    id: "scae_entende",
    name: "Investigador",
    description: "Atingiu o nível ENTENDE em uma habilidade",
    category: "scae_level",
    icon: "Search",
    color: "bg-yellow-100 text-yellow-700",
    criteria: { scaeLevel: "ENTENDE" },
  },
  {
    id: "primeira_ativ",
    name: "Primeira Atividade",
    description: "Completou a primeira atividade G-SCAE",
    category: "milestone",
    icon: "PlayCircle",
    color: "bg-purple-100 text-purple-700",
    criteria: { completions: 1 },
  },
];

const sampleEarned = [
  {
    id: "sb-1",
    userId: studentPayload.userId,
    badgeId: "scae_conhece",
    context: '{"habilidadeCode":"MA01","scaeLevel":"CONHECE"}',
    earnedAt: new Date("2026-05-20T10:00:00Z"),
  },
  {
    id: "sb-2",
    userId: studentPayload.userId,
    badgeId: "primeira_ativ",
    context: null,
    earnedAt: new Date("2026-05-18T10:00:00Z"),
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/v1/gscae/badges", () => {
  it("should return 401 without authentication", async () => {
    const request = unauthRequest();
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("should return 403 for non-student roles", async () => {
    const teacherPayload = { ...studentPayload, role: "TEACHER" as const };
    mockedVerifyToken.mockReturnValue(teacherPayload);

    const request = authRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return 403 for admin role", async () => {
    const adminPayload = { ...studentPayload, role: "ADMIN" as const };
    mockedVerifyToken.mockReturnValue(adminPayload);

    const request = authRequest();
    const response = await GET(request);

    expect(response.status).toBe(403);
  });

  it("should return all badges with earned status", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedBadgeFindMany.mockResolvedValue(sampleBadges as never);
    mockedStudentBadgeFindMany.mockResolvedValue(sampleEarned as never);

    const request = authRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.badges).toHaveLength(3);

    const explorador = data.badges.find(
      (b: { id: string }) => b.id === "scae_conhece",
    );
    expect(explorador.earned).toBe(true);
    expect(explorador.earnedAt).toBeTruthy();

    const investigador = data.badges.find(
      (b: { id: string }) => b.id === "scae_entende",
    );
    expect(investigador.earned).toBe(false);
    expect(investigador.earnedAt).toBeNull();
  });

  it("should return earned badges with badge details", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedBadgeFindMany.mockResolvedValue(sampleBadges as never);
    mockedStudentBadgeFindMany.mockResolvedValue(sampleEarned as never);

    const request = authRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(data.earned).toHaveLength(2);
    expect(data.earned[0].badge).toBeDefined();
    expect(data.earned[0].badge.name).toBe("Explorador");
  });

  it("should return correct summary", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedBadgeFindMany.mockResolvedValue(sampleBadges as never);
    mockedStudentBadgeFindMany.mockResolvedValue(sampleEarned as never);

    const request = authRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(data.summary.total).toBe(3);
    expect(data.summary.earned).toBe(2);
    expect(data.summary.byCategory.scae_level).toBe(1);
    expect(data.summary.byCategory.milestone).toBe(1);
  });

  it("should return empty earned list when student has no badges", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedBadgeFindMany.mockResolvedValue(sampleBadges as never);
    mockedStudentBadgeFindMany.mockResolvedValue([] as never);

    const request = authRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.earned).toHaveLength(0);
    expect(data.summary.earned).toBe(0);
    expect(data.badges.every((b: { earned: boolean }) => !b.earned)).toBe(true);
  });

  it("should only query earned badges for the authenticated user", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedBadgeFindMany.mockResolvedValue([] as never);
    mockedStudentBadgeFindMany.mockResolvedValue([] as never);

    const request = authRequest();
    await GET(request);

    expect(mockedStudentBadgeFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: studentPayload.userId },
      }),
    );
  });

  it("should not leak badges from another user", async () => {
    mockedVerifyToken.mockReturnValue(otherStudentPayload);
    mockedBadgeFindMany.mockResolvedValue(sampleBadges as never);
    mockedStudentBadgeFindMany.mockResolvedValue([] as never);

    const request = authRequest();
    await GET(request);

    expect(mockedStudentBadgeFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: otherStudentPayload.userId },
      }),
    );

    expect(mockedStudentBadgeFindMany).not.toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: studentPayload.userId },
      }),
    );
  });

  it("should order badges by category and id", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedBadgeFindMany.mockResolvedValue([] as never);
    mockedStudentBadgeFindMany.mockResolvedValue([] as never);

    const request = authRequest();
    await GET(request);

    expect(mockedBadgeFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ category: "asc" }, { id: "asc" }],
      }),
    );
  });

  it("should order earned badges by earnedAt descending", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedBadgeFindMany.mockResolvedValue([] as never);
    mockedStudentBadgeFindMany.mockResolvedValue([] as never);

    const request = authRequest();
    await GET(request);

    expect(mockedStudentBadgeFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { earnedAt: "desc" },
      }),
    );
  });
});
