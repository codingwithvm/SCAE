import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    teacherClass: {
      findUnique: vi.fn(),
    },
    studentClass: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/lib/assessment/report-data", () => ({
  TIER_LABELS: {
    "tier-1": "Iniciante",
    "tier-2": "Intermediário",
    "tier-3": "Avançado",
  },
  TIER_COLORS: {
    "tier-1": "#EF4444",
    "tier-2": "#F59E0B",
    "tier-3": "#10B981",
  },
}));

vi.mock("@/lib/assessment/profiles", () => ({
  PROFILES: {
    "instrument-1": {
      Criativo: { cor: "#C05621" },
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { GET } from "@/app/api/v1/(protected)/classes/[id]/assessments/route";

const mockedTeacherClassFindUnique = vi.mocked(prisma.teacherClass.findUnique);
const mockedStudentClassFindMany = vi.mocked(prisma.studentClass.findMany);
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

const otherTeacherTokenPayload = {
  userId: "660e8400-e29b-41d4-a716-446655440099",
  role: "TEACHER" as const,
  ...basePayload,
};

const schoolManagerTokenPayload = {
  userId: "770e8400-e29b-41d4-a716-446655440002",
  role: "SCHOOL_MANAGER" as const,
  ...basePayload,
};

const studentTokenPayload = {
  userId: "990e8400-e29b-41d4-a716-446655440004",
  role: "STUDENT" as const,
  ...basePayload,
};

const classId = "ccc00000-0000-0000-0000-000000000001";
const routeContext = { params: Promise.resolve({ id: classId }) };

const enrollmentWithAssessment = {
  classId,
  studentId: "ddd00000-0000-0000-0000-000000000001",
  student: {
    id: "ddd00000-0000-0000-0000-000000000001",
    name: "Maria Silva",
    registrationNumber: "2026001",
    assessments: [
      {
        id: "aaa00000-0000-0000-0000-000000000010",
        instrument: "instrument-1",
        completedAt: new Date("2026-03-15T10:00:00Z"),
        result: {
          profile: "Criativo",
          tier: "tier-3",
        },
      },
    ],
  },
};

const enrollmentWithoutAssessment = {
  classId,
  studentId: "ddd00000-0000-0000-0000-000000000002",
  student: {
    id: "ddd00000-0000-0000-0000-000000000002",
    name: "João Santos",
    registrationNumber: "2026002",
    assessments: [],
  },
};

describe("GET /api/v1/classes/:id/assessments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna alunos com dados de avaliação para admin", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedStudentClassFindMany.mockResolvedValueOnce([
      enrollmentWithAssessment,
      enrollmentWithoutAssessment,
    ] as never);

    const request = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/classes/${classId}/assessments`,
    );

    const response = await GET(request, routeContext);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.classId).toBe(classId);
    expect(data.students).toHaveLength(2);

    const completedStudent = data.students.find(
      (s: { studentId: string }) =>
        s.studentId === "ddd00000-0000-0000-0000-000000000001",
    );
    expect(completedStudent.profile).toBe("Criativo");
    expect(completedStudent.tier).toBe("tier-3");
    expect(completedStudent.tierLabel).toBe("Avançado");
    expect(completedStudent.assessmentId).toBe(
      "aaa00000-0000-0000-0000-000000000010",
    );

    const pendingStudent = data.students.find(
      (s: { studentId: string }) =>
        s.studentId === "ddd00000-0000-0000-0000-000000000002",
    );
    expect(pendingStudent.profile).toBeNull();
    expect(pendingStudent.assessmentId).toBeNull();
  });

  it("professor vinculado à turma pode acessar", async () => {
    mockedVerifyToken.mockReturnValueOnce(teacherTokenPayload);
    mockedTeacherClassFindUnique.mockResolvedValueOnce({
      teacherId: teacherTokenPayload.userId,
      classId,
    } as never);
    mockedStudentClassFindMany.mockResolvedValueOnce([] as never);

    const request = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/classes/${classId}/assessments`,
    );

    const response = await GET(request, routeContext);

    expect(response.status).toBe(200);
    expect(mockedTeacherClassFindUnique).toHaveBeenCalledWith({
      where: {
        teacherId_classId: {
          teacherId: teacherTokenPayload.userId,
          classId,
        },
      },
    });
  });

  it("retorna 403 para professor NÃO vinculado à turma", async () => {
    mockedVerifyToken.mockReturnValueOnce(otherTeacherTokenPayload);
    mockedTeacherClassFindUnique.mockResolvedValueOnce(null);

    const request = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/classes/${classId}/assessments`,
    );

    const response = await GET(request, routeContext);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Access denied");
  });

  it("retorna 403 para aluno tentando acessar avaliações da turma", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);

    const request = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/classes/${classId}/assessments`,
    );

    const response = await GET(request, routeContext);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Access denied");
  });

  it("gestor escolar pode acessar avaliações", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedStudentClassFindMany.mockResolvedValueOnce([] as never);

    const request = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/classes/${classId}/assessments`,
    );

    const response = await GET(request, routeContext);

    expect(response.status).toBe(200);
  });

  it("retorna 401 sem autenticação", async () => {
    const request = createUnauthenticatedRequest(
      "GET",
      `http://localhost/api/v1/classes/${classId}/assessments`,
    );

    const response = await GET(request, routeContext);

    expect(response.status).toBe(401);
  });

  it("não expõe passwordHash nos dados do aluno", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedStudentClassFindMany.mockResolvedValueOnce([
      enrollmentWithAssessment,
    ] as never);

    const request = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/classes/${classId}/assessments`,
    );

    const response = await GET(request, routeContext);
    const data = await response.json();

    const raw = JSON.stringify(data);
    expect(raw).not.toContain("passwordHash");
    expect(raw).not.toContain("password");
  });

  it("ordena alunos por nome em pt-BR", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedStudentClassFindMany.mockResolvedValueOnce([
      enrollmentWithoutAssessment,
      enrollmentWithAssessment,
    ] as never);

    const request = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/classes/${classId}/assessments`,
    );

    const response = await GET(request, routeContext);
    const data = await response.json();

    expect(data.students[0].studentName).toBe("João Santos");
    expect(data.students[1].studentName).toBe("Maria Silva");
  });
});
