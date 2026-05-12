import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    teacherClass: {
      findMany: vi.fn(),
    },
    class: {
      findMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { GET } from "@/app/api/v1/(protected)/classes/my/route";

const mockedTeacherClassFindMany = vi.mocked(prisma.teacherClass.findMany);
const mockedClassFindMany = vi.mocked(prisma.class.findMany);
const mockedUserFindUnique = vi.mocked(prisma.user.findUnique);
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

const basePayload = {
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400,
};

const adminTokenPayload = {
  userId: "550e8400-e29b-41d4-a716-446655440000",
  role: "ADMIN" as const,
  ...basePayload,
};

const teacherTokenPayload = {
  userId: "660e8400-e29b-41d4-a716-446655440001",
  role: "TEACHER" as const,
  ...basePayload,
};

const schoolManagerTokenPayload = {
  userId: "770e8400-e29b-41d4-a716-446655440002",
  role: "SCHOOL_MANAGER" as const,
  ...basePayload,
};

const municipalManagerTokenPayload = {
  userId: "880e8400-e29b-41d4-a716-446655440003",
  role: "MUNICIPAL_MANAGER" as const,
  ...basePayload,
};

const studentTokenPayload = {
  userId: "990e8400-e29b-41d4-a716-446655440004",
  role: "STUDENT" as const,
  ...basePayload,
};

const existingClass = {
  id: "ccc00000-0000-0000-0000-000000000001",
  name: "Turma A",
  grade: 5,
  year: 2026,
  schoolId: "bbb00000-0000-0000-0000-000000000001",
};

describe("GET /api/v1/classes/my", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna turmas vinculadas ao professor", async () => {
    mockedVerifyToken.mockReturnValueOnce(teacherTokenPayload);
    mockedTeacherClassFindMany.mockResolvedValueOnce([
      {
        teacherId: teacherTokenPayload.userId,
        classId: existingClass.id,
        class: existingClass,
      },
    ] as never);

    const request = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/classes/my",
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.classes).toHaveLength(1);
    expect(data.classes[0].id).toBe(existingClass.id);
    expect(mockedTeacherClassFindMany).toHaveBeenCalledWith({
      where: { teacherId: teacherTokenPayload.userId },
      include: {
        class: {
          select: { id: true, name: true, grade: true, year: true },
        },
      },
    });
  });

  it("retorna turmas da escola do gestor escolar", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedUserFindUnique.mockResolvedValueOnce({
      schoolId: "bbb00000-0000-0000-0000-000000000001",
    } as never);
    mockedClassFindMany.mockResolvedValueOnce([existingClass] as never);

    const request = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/classes/my",
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.classes).toHaveLength(1);
    expect(mockedClassFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          schoolId: "bbb00000-0000-0000-0000-000000000001",
        }),
      }),
    );
  });

  it("retorna turmas do município do gestor municipal", async () => {
    mockedVerifyToken.mockReturnValueOnce(municipalManagerTokenPayload);
    mockedUserFindUnique.mockResolvedValueOnce({
      municipalityId: "aaa00000-0000-0000-0000-000000000001",
    } as never);
    mockedClassFindMany.mockResolvedValueOnce([existingClass] as never);

    const request = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/classes/my",
    );

    const response = await GET(request);
    await response.json();

    expect(response.status).toBe(200);
    expect(mockedClassFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          school: {
            municipalityId: "aaa00000-0000-0000-0000-000000000001",
          },
        }),
      }),
    );
  });

  it("admin pode acessar todas as turmas", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindMany.mockResolvedValueOnce([existingClass] as never);

    const request = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/classes/my",
    );

    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it("retorna 403 para aluno", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);

    const request = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/classes/my",
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Access denied");
  });

  it("retorna 401 sem autenticação", async () => {
    const request = createUnauthenticatedRequest(
      "GET",
      "http://localhost/api/v1/classes/my",
    );

    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("professor só vê turmas que está vinculado (não vaza turmas de outros)", async () => {
    mockedVerifyToken.mockReturnValueOnce(teacherTokenPayload);
    mockedTeacherClassFindMany.mockResolvedValueOnce([] as never);

    const request = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/classes/my",
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.classes).toHaveLength(0);
    expect(mockedTeacherClassFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { teacherId: teacherTokenPayload.userId },
      }),
    );
  });

  it("gestor escolar sem schoolId recebe lista vazia (não vaza dados)", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedUserFindUnique.mockResolvedValueOnce({
      schoolId: null,
    } as never);
    mockedClassFindMany.mockResolvedValueOnce([] as never);

    const request = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/classes/my",
    );

    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it("filtra apenas turmas não deletadas", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindMany.mockResolvedValueOnce([] as never);

    const request = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/classes/my",
    );

    await GET(request);

    expect(mockedClassFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ deletedAt: null }),
      }),
    );
  });
});
