import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    school: {
      findFirst: vi.fn(),
    },
    municipality: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { GET, POST } from "@/app/api/v1/(protected)/users/route";
import {
  DELETE,
  GET as GET_BY_ID,
  PUT,
} from "@/app/api/v1/(protected)/users/[id]/route";

const mockedUserCreate = vi.mocked(prisma.user.create);
const mockedUserFindMany = vi.mocked(prisma.user.findMany);
const mockedUserFindFirst = vi.mocked(prisma.user.findFirst);
const mockedUserUpdate = vi.mocked(prisma.user.update);
const mockedUserCount = vi.mocked(prisma.user.count);
const mockedSchoolFindFirst = vi.mocked(prisma.school.findFirst);
const mockedMunicipalityFindFirst = vi.mocked(prisma.municipality.findFirst);
const mockedVerifyToken = vi.mocked(verifyToken);
const mockedHashPassword = vi.mocked(hashPassword);

function createAuthenticatedRequest(
  method: string,
  url: string,
  body?: Record<string, unknown>,
): Request {
  const requestOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid-admin-token",
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

const adminTokenPayload = {
  userId: "550e8400-e29b-41d4-a716-446655440000",
  role: "ADMIN" as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400,
};

const municipalManagerTokenPayload = {
  ...adminTokenPayload,
  userId: "660e8400-e29b-41d4-a716-446655440001",
  role: "MUNICIPAL_MANAGER" as const,
};

const existingMunicipalityId = "aaa00000-0000-0000-0000-000000000001";
const existingSchoolId = "bbb00000-0000-0000-0000-000000000001";
const existingClassId = "ccc00000-0000-0000-0000-000000000001";

const existingMunicipality = {
  id: existingMunicipalityId,
  name: "São Paulo",
  state: "SP",
  ibgeCode: "3550308",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  deletedAt: null,
};

const existingSchool = {
  id: existingSchoolId,
  municipalityId: existingMunicipalityId,
  name: "Escola Municipal São Paulo",
  inepCode: "35000001",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  deletedAt: null,
};

const existingStudent = {
  id: "ddd00000-0000-0000-0000-000000000001",
  role: "STUDENT" as const,
  name: "Maria Silva",
  email: null,
  registrationNumber: "2026001",
  birthDate: new Date("2015-03-10T00:00:00Z"),
  passwordHash: null,
  schoolId: existingSchoolId,
  municipalityId: existingMunicipalityId,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  deletedAt: null,
};

const existingTeacher = {
  id: "eee00000-0000-0000-0000-000000000002",
  role: "TEACHER" as const,
  name: "Carlos Oliveira",
  email: "carlos@escola.edu.br",
  registrationNumber: null,
  birthDate: null,
  passwordHash: "$2b$12$hashedpasswordhere",
  schoolId: existingSchoolId,
  municipalityId: existingMunicipalityId,
  createdAt: new Date("2026-01-02T00:00:00Z"),
  updatedAt: new Date("2026-01-02T00:00:00Z"),
  deletedAt: null,
};

const routeContext = {
  params: Promise.resolve({ id: existingTeacher.id }),
};

describe("POST /api/v1/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cria usuário de equipe com hash de senha e resposta sanitizada", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(existingSchool);
    mockedMunicipalityFindFirst.mockResolvedValueOnce(existingMunicipality);
    mockedHashPassword.mockResolvedValueOnce("hashed-password");
    mockedUserCreate.mockResolvedValueOnce(existingTeacher);

    const createUserRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/users",
      {
        role: "TEACHER",
        name: "Carlos Oliveira",
        email: "carlos@escola.edu.br",
        password: "senhaSegura123",
        schoolId: existingSchoolId,
        municipalityId: existingMunicipalityId,
      },
    );

    const createUserResponse = await POST(createUserRequest);
    const createUserResponseData = await createUserResponse.json();

    expect(createUserResponse.status).toBe(201);
    expect(createUserResponseData.passwordHash).toBeUndefined();
    expect(mockedHashPassword).toHaveBeenCalledWith("senhaSegura123");
    expect(mockedUserCreate).toHaveBeenCalledWith({
      data: {
        role: "TEACHER",
        name: "Carlos Oliveira",
        email: "carlos@escola.edu.br",
        registrationNumber: null,
        birthDate: null,
        passwordHash: "hashed-password",
        schoolId: existingSchoolId,
        municipalityId: existingMunicipalityId,
      },
    });
  });

  it("retorna 400 para estudante com birthDate inválida", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const createUserRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/users",
      {
        role: "STUDENT",
        name: "Maria Silva",
        registrationNumber: "2026001",
        birthDate: "not-a-date",
      },
    );

    const createUserResponse = await POST(createUserRequest);
    const errorResponseData = await createUserResponse.json();

    expect(createUserResponse.status).toBe(400);
    expect(errorResponseData.error).toBe("birthDate must be a valid date");
  });

  it("retorna 404 quando schoolId não existe", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(null);

    const createUserRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/users",
      {
        role: "STUDENT",
        name: "Maria Silva",
        registrationNumber: "2026001",
        birthDate: "2015-03-10",
        schoolId: "nonexistent-school-id",
      },
    );

    const createUserResponse = await POST(createUserRequest);
    const errorResponseData = await createUserResponse.json();

    expect(createUserResponse.status).toBe(404);
    expect(errorResponseData.error).toBe("School not found");
  });

  it("retorna 403 para perfil sem permissão", async () => {
    mockedVerifyToken.mockReturnValueOnce(municipalManagerTokenPayload);

    const createUserRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/users",
      {
        role: "STUDENT",
        name: "Maria Silva",
        registrationNumber: "2026001",
        birthDate: "2015-03-10",
      },
    );

    const createUserResponse = await POST(createUserRequest);
    const errorResponseData = await createUserResponse.json();

    expect(createUserResponse.status).toBe(403);
    expect(errorResponseData.error).toBe("Forbidden");
  });
});

describe("GET /api/v1/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lista usuários com paginação, filtros e sem passwordHash", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedUserFindMany.mockResolvedValueOnce([
      existingStudent,
      existingTeacher,
    ]);
    mockedUserCount.mockResolvedValueOnce(2);

    const listUsersRequest = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/users?role=TEACHER&schoolId=${existingSchoolId}&classId=${existingClassId}&page=2&perPage=10`,
    );

    const listUsersResponse = await GET(listUsersRequest);
    const listUsersResponseData = await listUsersResponse.json();

    expect(listUsersResponse.status).toBe(200);
    expect(JSON.stringify(listUsersResponseData)).not.toContain("passwordHash");
    expect(mockedUserFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          role: "TEACHER",
          schoolId: existingSchoolId,
          deletedAt: null,
          OR: [
            { taughtClasses: { some: { classId: existingClassId } } },
            { enrolledClasses: { some: { classId: existingClassId } } },
          ],
        }),
        select: expect.objectContaining({ passwordHash: false }),
        skip: 10,
        take: 10,
      }),
    );
  });

  it("retorna 401 sem autenticação", async () => {
    const listUsersRequest = createUnauthenticatedRequest(
      "GET",
      "http://localhost/api/v1/users",
    );

    const listUsersResponse = await GET(listUsersRequest);

    expect(listUsersResponse.status).toBe(401);
  });
});

describe("GET /api/v1/users/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna usuário por id sem passwordHash", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedUserFindFirst.mockResolvedValueOnce(existingTeacher);

    const getUserRequest = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/users/${existingTeacher.id}`,
    );

    const getUserResponse = await GET_BY_ID(getUserRequest, routeContext);
    const getUserResponseData = await getUserResponse.json();

    expect(getUserResponse.status).toBe(200);
    expect(getUserResponseData.id).toBe(existingTeacher.id);
    expect(getUserResponseData.passwordHash).toBeUndefined();
  });

  it("retorna 404 quando usuário não existe", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedUserFindFirst.mockResolvedValueOnce(null);

    const getUserRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/users/nonexistent-id",
    );

    const nonexistentRouteContext = {
      params: Promise.resolve({ id: "nonexistent-id" }),
    };

    const getUserResponse = await GET_BY_ID(
      getUserRequest,
      nonexistentRouteContext,
    );
    const errorResponseData = await getUserResponse.json();

    expect(getUserResponse.status).toBe(404);
    expect(errorResponseData.error).toBe("User not found");
  });
});

describe("PUT /api/v1/users/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("atualiza senha com hash", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedUserFindFirst.mockResolvedValueOnce(existingTeacher);
    mockedHashPassword.mockResolvedValueOnce("new-hashed-password");
    mockedUserUpdate.mockResolvedValueOnce(existingTeacher);

    const updateUserRequest = createAuthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/users/${existingTeacher.id}`,
      { password: "novaSenha123" },
    );

    await PUT(updateUserRequest, routeContext);

    expect(mockedHashPassword).toHaveBeenCalledWith("novaSenha123");
    expect(mockedUserUpdate).toHaveBeenCalledWith({
      where: { id: existingTeacher.id },
      data: expect.objectContaining({ passwordHash: "new-hashed-password" }),
    });
  });

  it("retorna 400 quando body está vazio", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedUserFindFirst.mockResolvedValueOnce(existingTeacher);

    const updateUserRequest = createAuthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/users/${existingTeacher.id}`,
      {},
    );

    const updateUserResponse = await PUT(updateUserRequest, routeContext);
    const errorResponseData = await updateUserResponse.json();

    expect(updateUserResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("retorna 409 em conflito de email único", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedUserFindFirst.mockResolvedValueOnce(existingTeacher);
    mockedUserUpdate.mockRejectedValueOnce({
      code: "P2002",
      meta: { target: ["email"] },
    });

    const updateUserRequest = createAuthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/users/${existingTeacher.id}`,
      { email: "duplicado@escola.edu.br" },
    );

    const updateUserResponse = await PUT(updateUserRequest, routeContext);
    const errorResponseData = await updateUserResponse.json();

    expect(updateUserResponse.status).toBe(409);
    expect(errorResponseData.error).toBe("User with this email already exists");
  });
});

describe("DELETE /api/v1/users/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("faz soft delete do usuário", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedUserFindFirst.mockResolvedValueOnce(existingTeacher);
    mockedUserUpdate.mockResolvedValueOnce({
      ...existingTeacher,
      deletedAt: new Date(),
    });

    const deleteUserRequest = createAuthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/users/${existingTeacher.id}`,
    );

    const deleteUserResponse = await DELETE(deleteUserRequest, routeContext);
    const deleteUserResponseData = await deleteUserResponse.json();

    expect(deleteUserResponse.status).toBe(200);
    expect(deleteUserResponseData.message).toBe("User deleted");
    expect(mockedUserUpdate).toHaveBeenCalledWith({
      where: { id: existingTeacher.id },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it("retorna 403 para perfil sem permissão", async () => {
    mockedVerifyToken.mockReturnValueOnce(municipalManagerTokenPayload);

    const deleteUserRequest = createAuthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/users/${existingTeacher.id}`,
    );

    const deleteUserResponse = await DELETE(deleteUserRequest, routeContext);

    expect(deleteUserResponse.status).toBe(403);
  });
});
