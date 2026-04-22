import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    class: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    school: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { GET, POST } from "@/app/api/v1/(protected)/classes/route";
import {
  GET as GET_BY_ID,
  PUT,
  DELETE,
} from "@/app/api/v1/(protected)/classes/[id]/route";

const mockedClassCreate = vi.mocked(prisma.class.create);
const mockedClassFindMany = vi.mocked(prisma.class.findMany);
const mockedClassFindFirst = vi.mocked(prisma.class.findFirst);
const mockedClassUpdate = vi.mocked(prisma.class.update);
const mockedClassCount = vi.mocked(prisma.class.count);
const mockedSchoolFindFirst = vi.mocked(prisma.school.findFirst);
const mockedVerifyToken = vi.mocked(verifyToken);

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

const schoolManagerTokenPayload = {
  ...adminTokenPayload,
  userId: "660e8400-e29b-41d4-a716-446655440001",
  role: "SCHOOL_MANAGER" as const,
};

const studentTokenPayload = {
  ...adminTokenPayload,
  userId: "770e8400-e29b-41d4-a716-446655440002",
  role: "STUDENT" as const,
};

const existingSchoolId = "aaa00000-0000-0000-0000-000000000001";

const existingSchool = {
  id: existingSchoolId,
  municipalityId: "bbb00000-0000-0000-0000-000000000001",
  name: "Escola Municipal São Paulo",
  inepCode: "35000001",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  deletedAt: null,
};

const existingClass = {
  id: "ccc00000-0000-0000-0000-000000000001",
  schoolId: existingSchoolId,
  name: "5º Ano A",
  grade: 5,
  year: 2026,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  deletedAt: null,
};

const secondClass = {
  id: "ddd00000-0000-0000-0000-000000000002",
  schoolId: existingSchoolId,
  name: "3º Ano B",
  grade: 3,
  year: 2026,
  createdAt: new Date("2026-01-02T00:00:00Z"),
  updatedAt: new Date("2026-01-02T00:00:00Z"),
  deletedAt: null,
};

const routeContext = {
  params: Promise.resolve({ id: existingClass.id }),
};

describe("POST /api/v1/classes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a class and returns 201", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(existingSchool);
    mockedClassCreate.mockResolvedValueOnce(existingClass);

    const createClassRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/classes",
      { schoolId: existingSchoolId, name: "5º Ano A", grade: 5, year: 2026 },
    );

    const createClassResponse = await POST(createClassRequest);
    const createClassResponseData = await createClassResponse.json();

    expect(createClassResponse.status).toBe(201);
    expect(createClassResponseData.id).toBe(existingClass.id);
    expect(createClassResponseData.name).toBe("5º Ano A");
    expect(createClassResponseData.grade).toBe(5);
    expect(createClassResponseData.year).toBe(2026);
    expect(createClassResponseData.schoolId).toBe(existingSchoolId);
  });

  it("returns 400 when schoolId is missing", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const createClassRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/classes",
      { name: "5º Ano A", grade: 5, year: 2026 },
    );

    const createClassResponse = await POST(createClassRequest);
    const errorResponseData = await createClassResponse.json();

    expect(createClassResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("returns 400 when name is missing", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const createClassRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/classes",
      { schoolId: existingSchoolId, grade: 5, year: 2026 },
    );

    const createClassResponse = await POST(createClassRequest);
    const errorResponseData = await createClassResponse.json();

    expect(createClassResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("returns 400 when grade is missing", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const createClassRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/classes",
      { schoolId: existingSchoolId, name: "5º Ano A", year: 2026 },
    );

    const createClassResponse = await POST(createClassRequest);
    const errorResponseData = await createClassResponse.json();

    expect(createClassResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("returns 400 when year is missing", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const createClassRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/classes",
      { schoolId: existingSchoolId, name: "5º Ano A", grade: 5 },
    );

    const createClassResponse = await POST(createClassRequest);
    const errorResponseData = await createClassResponse.json();

    expect(createClassResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("returns 400 when grade is outside 1-9 range", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const createClassRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/classes",
      { schoolId: existingSchoolId, name: "10º Ano A", grade: 10, year: 2026 },
    );

    const createClassResponse = await POST(createClassRequest);
    const errorResponseData = await createClassResponse.json();

    expect(createClassResponse.status).toBe(400);
    expect(errorResponseData.error).toBe("grade must be between 1 and 9");
  });

  it("returns 404 when schoolId does not exist", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(null);

    const createClassRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/classes",
      {
        schoolId: "nonexistent-school-id",
        name: "5º Ano A",
        grade: 5,
        year: 2026,
      },
    );

    const createClassResponse = await POST(createClassRequest);
    const errorResponseData = await createClassResponse.json();

    expect(createClassResponse.status).toBe(404);
    expect(errorResponseData.error).toBe("School not found");
  });

  it("allows SCHOOL_MANAGER to create classes", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(existingSchool);
    mockedClassCreate.mockResolvedValueOnce(existingClass);

    const createClassRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/classes",
      { schoolId: existingSchoolId, name: "5º Ano A", grade: 5, year: 2026 },
    );

    const createClassResponse = await POST(createClassRequest);

    expect(createClassResponse.status).toBe(201);
  });

  it("returns 401 without authentication", async () => {
    const createClassRequest = createUnauthenticatedRequest(
      "POST",
      "http://localhost/api/v1/classes",
      { schoolId: existingSchoolId, name: "5º Ano A", grade: 5, year: 2026 },
    );

    const createClassResponse = await POST(createClassRequest);
    const errorResponseData = await createClassResponse.json();

    expect(createClassResponse.status).toBe(401);
    expect(errorResponseData.error).toBe("Authentication required");
  });

  it("returns 403 for unauthorized roles", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);

    const createClassRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/classes",
      { schoolId: existingSchoolId, name: "5º Ano A", grade: 5, year: 2026 },
    );

    const createClassResponse = await POST(createClassRequest);
    const errorResponseData = await createClassResponse.json();

    expect(createClassResponse.status).toBe(403);
    expect(errorResponseData.error).toBe("Forbidden");
  });
});

describe("GET /api/v1/classes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a list of classes", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindMany.mockResolvedValueOnce([existingClass, secondClass]);
    mockedClassCount.mockResolvedValueOnce(2);

    const listClassesRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/classes",
    );

    const listClassesResponse = await GET(listClassesRequest);
    const listClassesResponseData = await listClassesResponse.json();

    expect(listClassesResponse.status).toBe(200);
    expect(listClassesResponseData.data).toHaveLength(2);
    expect(listClassesResponseData.total).toBe(2);
  });

  it("filters classes by schoolId", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindMany.mockResolvedValueOnce([existingClass]);
    mockedClassCount.mockResolvedValueOnce(1);

    const listClassesRequest = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/classes?schoolId=${existingSchoolId}`,
    );

    await GET(listClassesRequest);

    expect(mockedClassFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ schoolId: existingSchoolId }),
      }),
    );
  });

  it("filters classes by year", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindMany.mockResolvedValueOnce([existingClass]);
    mockedClassCount.mockResolvedValueOnce(1);

    const listClassesRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/classes?year=2026",
    );

    await GET(listClassesRequest);

    expect(mockedClassFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ year: 2026 }),
      }),
    );
  });

  it("filters classes by grade", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindMany.mockResolvedValueOnce([existingClass]);
    mockedClassCount.mockResolvedValueOnce(1);

    const listClassesRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/classes?grade=5",
    );

    await GET(listClassesRequest);

    expect(mockedClassFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ grade: 5 }),
      }),
    );
  });

  it("only returns non-deleted classes", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindMany.mockResolvedValueOnce([]);
    mockedClassCount.mockResolvedValueOnce(0);

    const listClassesRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/classes",
    );

    await GET(listClassesRequest);

    expect(mockedClassFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ deletedAt: null }),
      }),
    );
  });

  it("supports pagination with page and perPage", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindMany.mockResolvedValueOnce([existingClass]);
    mockedClassCount.mockResolvedValueOnce(50);

    const listClassesRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/classes?page=3&perPage=5",
    );

    await GET(listClassesRequest);

    expect(mockedClassFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 5,
      }),
    );
  });

  it("returns 401 without authentication", async () => {
    const listClassesRequest = createUnauthenticatedRequest(
      "GET",
      "http://localhost/api/v1/classes",
    );

    const listClassesResponse = await GET(listClassesRequest);

    expect(listClassesResponse.status).toBe(401);
  });
});

describe("GET /api/v1/classes/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a class by id", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindFirst.mockResolvedValueOnce(existingClass);

    const getClassRequest = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/classes/${existingClass.id}`,
    );

    const getClassResponse = await GET_BY_ID(getClassRequest, routeContext);
    const getClassResponseData = await getClassResponse.json();

    expect(getClassResponse.status).toBe(200);
    expect(getClassResponseData.id).toBe(existingClass.id);
    expect(getClassResponseData.name).toBe("5º Ano A");
  });

  it("returns 404 when class does not exist", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindFirst.mockResolvedValueOnce(null);

    const getClassRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/classes/nonexistent-id",
    );

    const nonexistentRouteContext = {
      params: Promise.resolve({ id: "nonexistent-id" }),
    };

    const getClassResponse = await GET_BY_ID(
      getClassRequest,
      nonexistentRouteContext,
    );
    const errorResponseData = await getClassResponse.json();

    expect(getClassResponse.status).toBe(404);
    expect(errorResponseData.error).toBe("Class not found");
  });

  it("does not return soft-deleted classes", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindFirst.mockResolvedValueOnce(null);

    const getClassRequest = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/classes/${existingClass.id}`,
    );

    await GET_BY_ID(getClassRequest, routeContext);

    expect(mockedClassFindFirst).toHaveBeenCalledWith({
      where: { id: existingClass.id, deletedAt: null },
    });
  });

  it("returns 401 without authentication", async () => {
    const getClassRequest = createUnauthenticatedRequest(
      "GET",
      `http://localhost/api/v1/classes/${existingClass.id}`,
    );

    const getClassResponse = await GET_BY_ID(getClassRequest, routeContext);

    expect(getClassResponse.status).toBe(401);
  });
});

describe("PUT /api/v1/classes/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a class and returns 200", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindFirst.mockResolvedValueOnce(existingClass);
    const updatedClass = { ...existingClass, name: "5º Ano B" };
    mockedClassUpdate.mockResolvedValueOnce(updatedClass);

    const updateClassRequest = createAuthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/classes/${existingClass.id}`,
      { name: "5º Ano B" },
    );

    const updateClassResponse = await PUT(updateClassRequest, routeContext);
    const updateClassResponseData = await updateClassResponse.json();

    expect(updateClassResponse.status).toBe(200);
    expect(updateClassResponseData.name).toBe("5º Ano B");
  });

  it("returns 404 when class does not exist", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindFirst.mockResolvedValueOnce(null);

    const updateClassRequest = createAuthenticatedRequest(
      "PUT",
      "http://localhost/api/v1/classes/nonexistent-id",
      { name: "Updated" },
    );

    const nonexistentRouteContext = {
      params: Promise.resolve({ id: "nonexistent-id" }),
    };

    const updateClassResponse = await PUT(
      updateClassRequest,
      nonexistentRouteContext,
    );
    const errorResponseData = await updateClassResponse.json();

    expect(updateClassResponse.status).toBe(404);
    expect(errorResponseData.error).toBe("Class not found");
  });

  it("returns 400 when body is empty", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindFirst.mockResolvedValueOnce(existingClass);

    const updateClassRequest = createAuthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/classes/${existingClass.id}`,
      {},
    );

    const updateClassResponse = await PUT(updateClassRequest, routeContext);
    const errorResponseData = await updateClassResponse.json();

    expect(updateClassResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("returns 400 when grade is outside 1-9 range", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindFirst.mockResolvedValueOnce(existingClass);

    const updateClassRequest = createAuthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/classes/${existingClass.id}`,
      { grade: 0 },
    );

    const updateClassResponse = await PUT(updateClassRequest, routeContext);
    const errorResponseData = await updateClassResponse.json();

    expect(updateClassResponse.status).toBe(400);
    expect(errorResponseData.error).toBe("grade must be between 1 and 9");
  });

  it("returns 404 when updating schoolId to nonexistent school", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindFirst.mockResolvedValueOnce(existingClass);
    mockedSchoolFindFirst.mockResolvedValueOnce(null);

    const updateClassRequest = createAuthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/classes/${existingClass.id}`,
      { schoolId: "nonexistent-school-id" },
    );

    const updateClassResponse = await PUT(updateClassRequest, routeContext);
    const errorResponseData = await updateClassResponse.json();

    expect(updateClassResponse.status).toBe(404);
    expect(errorResponseData.error).toBe("School not found");
  });

  it("returns 401 without authentication", async () => {
    const updateClassRequest = createUnauthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/classes/${existingClass.id}`,
      { name: "Updated" },
    );

    const updateClassResponse = await PUT(updateClassRequest, routeContext);

    expect(updateClassResponse.status).toBe(401);
  });

  it("returns 403 for unauthorized roles", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);

    const updateClassRequest = createAuthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/classes/${existingClass.id}`,
      { name: "Updated" },
    );

    const updateClassResponse = await PUT(updateClassRequest, routeContext);

    expect(updateClassResponse.status).toBe(403);
  });
});

describe("DELETE /api/v1/classes/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("soft deletes a class and returns 200", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindFirst.mockResolvedValueOnce(existingClass);
    const softDeletedClass = { ...existingClass, deletedAt: new Date() };
    mockedClassUpdate.mockResolvedValueOnce(softDeletedClass);

    const deleteClassRequest = createAuthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/classes/${existingClass.id}`,
    );

    const deleteClassResponse = await DELETE(deleteClassRequest, routeContext);
    const deleteClassResponseData = await deleteClassResponse.json();

    expect(deleteClassResponse.status).toBe(200);
    expect(deleteClassResponseData.message).toBe("Class deleted");
  });

  it("returns 404 when class does not exist", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindFirst.mockResolvedValueOnce(null);

    const deleteClassRequest = createAuthenticatedRequest(
      "DELETE",
      "http://localhost/api/v1/classes/nonexistent-id",
    );

    const nonexistentRouteContext = {
      params: Promise.resolve({ id: "nonexistent-id" }),
    };

    const deleteClassResponse = await DELETE(
      deleteClassRequest,
      nonexistentRouteContext,
    );
    const errorResponseData = await deleteClassResponse.json();

    expect(deleteClassResponse.status).toBe(404);
    expect(errorResponseData.error).toBe("Class not found");
  });

  it("uses soft delete (sets deletedAt) instead of hard delete", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedClassFindFirst.mockResolvedValueOnce(existingClass);
    mockedClassUpdate.mockResolvedValueOnce({
      ...existingClass,
      deletedAt: new Date(),
    });

    const deleteClassRequest = createAuthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/classes/${existingClass.id}`,
    );

    await DELETE(deleteClassRequest, routeContext);

    expect(mockedClassUpdate).toHaveBeenCalledWith({
      where: { id: existingClass.id },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it("returns 401 without authentication", async () => {
    const deleteClassRequest = createUnauthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/classes/${existingClass.id}`,
    );

    const deleteClassResponse = await DELETE(deleteClassRequest, routeContext);

    expect(deleteClassResponse.status).toBe(401);
  });

  it("returns 403 for unauthorized roles", async () => {
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);

    const deleteClassRequest = createAuthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/classes/${existingClass.id}`,
    );

    const deleteClassResponse = await DELETE(deleteClassRequest, routeContext);

    expect(deleteClassResponse.status).toBe(403);
  });
});
