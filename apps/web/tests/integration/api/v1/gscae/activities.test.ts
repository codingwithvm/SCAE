import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    activity: {
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
import { GET } from "@/app/api/v1/(protected)/gscae/activities/route";

const mockedActivityFindMany = vi.mocked(prisma.activity.findMany);
const mockedActivityCount = vi.mocked(prisma.activity.count);
const mockedVerifyToken = vi.mocked(verifyToken);

const BASE_URL = "http://localhost:3000/api/v1/gscae/activities";

const studentPayload = {
  userId: "550e8400-e29b-41d4-a716-446655440000",
  role: "STUDENT" as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400,
};

function authRequest(url = BASE_URL): Request {
  return new Request(url, {
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

const sampleActivities = [
  {
    id: "act-1",
    habilidadeCode: "MA01",
    habilidadeDesc: "Resolver problemas",
    discipline: "Matemática",
    grade: "5",
    title: "Atividade 1",
    activityVersion: "1.0",
  },
  {
    id: "act-2",
    habilidadeCode: "LP01",
    habilidadeDesc: "Leitura e interpretação",
    discipline: "Língua Portuguesa",
    grade: "5",
    title: "Atividade 2",
    activityVersion: "1.0",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/v1/gscae/activities", () => {
  it("should return 401 without authentication", async () => {
    const request = unauthRequest();
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("should return 403 for TEACHER role", async () => {
    const teacherPayload = { ...studentPayload, role: "TEACHER" as const };
    mockedVerifyToken.mockReturnValue(teacherPayload);

    const request = authRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return 403 for ADMIN role", async () => {
    const adminPayload = { ...studentPayload, role: "ADMIN" as const };
    mockedVerifyToken.mockReturnValue(adminPayload);

    const request = authRequest();
    const response = await GET(request);

    expect(response.status).toBe(403);
  });

  it("should return activities list with correct shape", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedActivityFindMany.mockResolvedValue(sampleActivities as never);
    mockedActivityCount.mockResolvedValue(2 as never);

    const request = authRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.activities).toHaveLength(2);
    expect(data.activities[0]).toHaveProperty("id");
    expect(data.activities[0]).toHaveProperty("habilidadeCode");
    expect(data.activities[0]).toHaveProperty("title");
    expect(data.activities[0]).not.toHaveProperty("htmlContent");
    expect(data.activities[0]).not.toHaveProperty("level1Content");
    expect(data.pagination).toEqual({ page: 1, limit: 20, total: 2 });
  });

  it("should respect pagination params", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedActivityFindMany.mockResolvedValue([] as never);
    mockedActivityCount.mockResolvedValue(50 as never);

    const request = authRequest(`${BASE_URL}?page=3&limit=10`);
    await GET(request);

    expect(mockedActivityFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
  });

  it("should filter by discipline", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedActivityFindMany.mockResolvedValue([] as never);
    mockedActivityCount.mockResolvedValue(0 as never);

    const request = authRequest(`${BASE_URL}?discipline=Matemática`);
    await GET(request);

    expect(mockedActivityFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ discipline: "Matemática" }),
      }),
    );
  });

  it("should filter by grade", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedActivityFindMany.mockResolvedValue([] as never);
    mockedActivityCount.mockResolvedValue(0 as never);

    const request = authRequest(`${BASE_URL}?grade=5`);
    await GET(request);

    expect(mockedActivityFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ grade: "5" }),
      }),
    );
  });

  it("should only return active activities", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedActivityFindMany.mockResolvedValue([] as never);
    mockedActivityCount.mockResolvedValue(0 as never);

    const request = authRequest();
    await GET(request);

    expect(mockedActivityFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      }),
    );
    expect(mockedActivityCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      }),
    );
  });
});
