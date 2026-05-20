import { beforeEach, describe, expect, it, vi } from "vitest";
import * as XLSX from "xlsx";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    school: {
      findFirst: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { POST } from "@/app/api/v1/(protected)/users/import/route";

const mockedSchoolFindFirst = vi.mocked(prisma.school.findFirst);
const mockedUserFindMany = vi.mocked(prisma.user.findMany);
const mockedUserCreateMany = vi.mocked(prisma.user.createMany);
const mockedVerifyToken = vi.mocked(verifyToken);

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

const studentTokenPayload = {
  userId: "880e8400-e29b-41d4-a716-446655440003",
  role: "STUDENT" as const,
  ...basePayload,
};

const existingSchool = {
  id: "bbb00000-0000-0000-0000-000000000001",
  municipalityId: "aaa00000-0000-0000-0000-000000000001",
};

function createExcelBuffer(rows: unknown[][]): ArrayBuffer {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, "Alunos");
  const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return buffer;
}

function createImportRequest(
  file: File | null,
  schoolId: string | null,
  token: string = "valid-admin-token",
): Request {
  const formData = new FormData();
  if (file) formData.append("file", file);
  if (schoolId) formData.append("schoolId", schoolId);

  return new Request("http://localhost/api/v1/users/import", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

function createExcelFile(rows: unknown[][], name = "alunos.xlsx"): File {
  const buffer = createExcelBuffer(rows);
  return new File([buffer], name, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

const validRows = [
  ["Nome", "Matrícula", "Data de Nascimento"],
  ["Maria Silva", "2026001", "15/03/2015"],
  ["João Santos", "2026002", "22/07/2014"],
];

describe("POST /api/v1/users/import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should import students successfully from a valid spreadsheet", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(existingSchool as never);
    mockedUserFindMany.mockResolvedValueOnce([]);
    mockedUserCreateMany.mockResolvedValueOnce({ count: 2 });

    const file = createExcelFile(validRows);
    const request = createImportRequest(file, existingSchool.id);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.created).toBe(2);
    expect(data.total).toBe(2);
    expect(data.errors).toHaveLength(0);

    expect(mockedUserCreateMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          role: "STUDENT",
          name: "Maria Silva",
          registrationNumber: "2026001",
          schoolId: existingSchool.id,
          municipalityId: existingSchool.municipalityId,
          email: null,
          passwordHash: null,
        }),
      ]),
      skipDuplicates: true,
    });
  });

  it("should return validation errors for invalid rows", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(existingSchool as never);
    mockedUserFindMany.mockResolvedValueOnce([]);
    mockedUserCreateMany.mockResolvedValueOnce({ count: 1 });

    const rows = [
      ["Nome", "Matrícula", "Data de Nascimento"],
      ["Maria Silva", "2026001", "15/03/2015"],
      ["", "2026002", "data-invalida"],
    ];

    const file = createExcelFile(rows);
    const request = createImportRequest(file, existingSchool.id);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(207);
    expect(data.created).toBe(1);
    expect(data.errors.length).toBeGreaterThan(0);
    expect(data.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ row: 3, field: "Nome" }),
        expect.objectContaining({ row: 3, field: "Data de Nascimento" }),
      ]),
    );
  });

  it("should detect duplicate registration numbers in the system", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(existingSchool as never);
    mockedUserFindMany.mockResolvedValueOnce([
      { registrationNumber: "2026001" },
    ] as never);
    mockedUserCreateMany.mockResolvedValueOnce({ count: 1 });

    const file = createExcelFile(validRows);
    const request = createImportRequest(file, existingSchool.id);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(207);
    expect(data.created).toBe(1);
    expect(data.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "Matrícula",
          message: expect.stringContaining("2026001"),
        }),
      ]),
    );
  });

  it("should return 400 without a file", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const request = createImportRequest(null, existingSchool.id);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Arquivo Excel é obrigatório");
  });

  it("should return 400 without a school", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const file = createExcelFile(validRows);
    const request = createImportRequest(file, null);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Escola é obrigatória");
  });

  it("should return 404 for a nonexistent school", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(null);

    const file = createExcelFile(validRows);
    const request = createImportRequest(file, "nonexistent-school");
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Escola não encontrada");
  });

  it("should return 400 for missing required columns", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(existingSchool as never);

    const rows = [
      ["Nome", "Email"],
      ["Maria Silva", "maria@test.com"],
    ];

    const file = createExcelFile(rows);
    const request = createImportRequest(file, existingSchool.id);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Colunas obrigatórias não encontradas");
    expect(data.error).toContain("Matrícula");
    expect(data.error).toContain("Data de Nascimento");
  });

  it("should return 400 for an empty spreadsheet (no data rows)", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(existingSchool as never);

    const rows = [["Nome", "Matrícula", "Data de Nascimento"]];

    const file = createExcelFile(rows);
    const request = createImportRequest(file, existingSchool.id);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Planilha não contém dados");
  });

  it("should return 400 for an invalid file format", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const file = new File(["conteudo texto"], "alunos.txt", {
      type: "text/plain",
    });

    const request = createImportRequest(file, existingSchool.id);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Formato inválido");
  });

  it("should return 403 for TEACHER role", async () => {
    mockedVerifyToken.mockReturnValueOnce(teacherTokenPayload);

    const file = createExcelFile(validRows);
    const request = createImportRequest(file, existingSchool.id);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return 403 for SCHOOL_MANAGER role", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);

    const file = createExcelFile(validRows);
    const request = createImportRequest(file, existingSchool.id);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return 403 for STUDENT role", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);

    const file = createExcelFile(validRows);
    const request = createImportRequest(file, existingSchool.id);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return 401 without authentication", async () => {
    const formData = new FormData();
    const file = createExcelFile(validRows);
    formData.append("file", file);
    formData.append("schoolId", existingSchool.id);

    const request = new Request("http://localhost/api/v1/users/import", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it("should accept dates in ISO format (YYYY-MM-DD)", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(existingSchool as never);
    mockedUserFindMany.mockResolvedValueOnce([]);
    mockedUserCreateMany.mockResolvedValueOnce({ count: 1 });

    const rows = [
      ["Nome", "Matrícula", "Data de Nascimento"],
      ["Ana Costa", "2026005", "2015-03-15"],
    ];

    const file = createExcelFile(rows);
    const request = createImportRequest(file, existingSchool.id);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.created).toBe(1);
  });

  it("should link students to the correct school and municipality", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(existingSchool as never);
    mockedUserFindMany.mockResolvedValueOnce([]);
    mockedUserCreateMany.mockResolvedValueOnce({ count: 2 });

    const file = createExcelFile(validRows);
    const request = createImportRequest(file, existingSchool.id);
    await POST(request);

    expect(mockedUserCreateMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          schoolId: existingSchool.id,
          municipalityId: existingSchool.municipalityId,
        }),
      ]),
      skipDuplicates: true,
    });
  });

  it("should not generate passwordHash for imported students", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(existingSchool as never);
    mockedUserFindMany.mockResolvedValueOnce([]);
    mockedUserCreateMany.mockResolvedValueOnce({ count: 2 });

    const file = createExcelFile(validRows);
    const request = createImportRequest(file, existingSchool.id);
    await POST(request);

    const callArgs = mockedUserCreateMany.mock.calls[0]!;
    const callData = callArgs[0]!.data;
    for (const student of callData as unknown as Record<string, unknown>[]) {
      expect(student.passwordHash).toBeNull();
    }
  });
});
