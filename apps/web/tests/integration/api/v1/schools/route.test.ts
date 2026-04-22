import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    school: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    municipality: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { GET, POST } from "@/app/api/v1/(protected)/schools/route";
import {
  GET as GET_BY_ID,
  PUT,
  DELETE,
} from "@/app/api/v1/(protected)/schools/[id]/route";

const mockedSchoolCreate = vi.mocked(prisma.school.create);
const mockedSchoolFindMany = vi.mocked(prisma.school.findMany);
const mockedSchoolFindFirst = vi.mocked(prisma.school.findFirst);
const mockedSchoolUpdate = vi.mocked(prisma.school.update);
const mockedSchoolCount = vi.mocked(prisma.school.count);
const mockedMunicipalityFindFirst = vi.mocked(prisma.municipality.findFirst);
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

const municipalManagerTokenPayload = {
  ...adminTokenPayload,
  userId: "660e8400-e29b-41d4-a716-446655440001",
  role: "MUNICIPAL_MANAGER" as const,
};

const schoolManagerTokenPayload = {
  ...adminTokenPayload,
  userId: "770e8400-e29b-41d4-a716-446655440002",
  role: "SCHOOL_MANAGER" as const,
};

const teacherTokenPayload = {
  ...adminTokenPayload,
  userId: "880e8400-e29b-41d4-a716-446655440003",
  role: "TEACHER" as const,
};

const existingMunicipalityId = "aaa00000-0000-0000-0000-000000000001";

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
  id: "bbb00000-0000-0000-0000-000000000001",
  municipalityId: existingMunicipalityId,
  name: "Escola Municipal São Paulo",
  inepCode: "35000001",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  deletedAt: null,
};

const secondSchool = {
  id: "ccc00000-0000-0000-0000-000000000002",
  municipalityId: existingMunicipalityId,
  name: "Escola Estadual Campinas",
  inepCode: "35000002",
  createdAt: new Date("2026-01-02T00:00:00Z"),
  updatedAt: new Date("2026-01-02T00:00:00Z"),
  deletedAt: null,
};

const routeContext = {
  params: Promise.resolve({ id: existingSchool.id }),
};

describe("POST /api/v1/schools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a school and returns 201", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindFirst.mockResolvedValueOnce(existingMunicipality);
    mockedSchoolCreate.mockResolvedValueOnce(existingSchool);

    const createSchoolRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/schools",
      {
        municipalityId: existingMunicipalityId,
        name: "Escola Municipal São Paulo",
        inepCode: "35000001",
      },
    );

    const createSchoolResponse = await POST(createSchoolRequest);
    const createSchoolResponseData = await createSchoolResponse.json();

    expect(createSchoolResponse.status).toBe(201);
    expect(createSchoolResponseData.id).toBe(existingSchool.id);
    expect(createSchoolResponseData.name).toBe("Escola Municipal São Paulo");
    expect(createSchoolResponseData.inepCode).toBe("35000001");
    expect(createSchoolResponseData.municipalityId).toBe(
      existingMunicipalityId,
    );
  });

  it("returns 400 when name is missing", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const createSchoolRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/schools",
      { municipalityId: existingMunicipalityId, inepCode: "35000001" },
    );

    const createSchoolResponse = await POST(createSchoolRequest);
    const errorResponseData = await createSchoolResponse.json();

    expect(createSchoolResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("returns 400 when municipalityId is missing", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const createSchoolRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/schools",
      { name: "Escola Municipal São Paulo", inepCode: "35000001" },
    );

    const createSchoolResponse = await POST(createSchoolRequest);
    const errorResponseData = await createSchoolResponse.json();

    expect(createSchoolResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("returns 400 when inepCode is missing", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const createSchoolRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/schools",
      { municipalityId: existingMunicipalityId, name: "Escola Municipal SP" },
    );

    const createSchoolResponse = await POST(createSchoolRequest);
    const errorResponseData = await createSchoolResponse.json();

    expect(createSchoolResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("returns 404 when municipalityId does not exist", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindFirst.mockResolvedValueOnce(null);

    const createSchoolRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/schools",
      {
        municipalityId: "nonexistent-municipality-id",
        name: "Escola Fantasma",
        inepCode: "99999999",
      },
    );

    const createSchoolResponse = await POST(createSchoolRequest);
    const errorResponseData = await createSchoolResponse.json();

    expect(createSchoolResponse.status).toBe(404);
    expect(errorResponseData.error).toBe("Municipality not found");
  });

  it("returns 409 when inepCode already exists", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindFirst.mockResolvedValueOnce(existingMunicipality);
    mockedSchoolCreate.mockRejectedValueOnce({
      code: "P2002",
      meta: { target: ["inep_code"] },
    });

    const createSchoolRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/schools",
      {
        municipalityId: existingMunicipalityId,
        name: "Escola Duplicada",
        inepCode: "35000001",
      },
    );

    const createSchoolResponse = await POST(createSchoolRequest);
    const errorResponseData = await createSchoolResponse.json();

    expect(createSchoolResponse.status).toBe(409);
    expect(errorResponseData.error).toBe(
      "School with this INEP code already exists",
    );
  });

  it("allows MUNICIPAL_MANAGER to create schools", async () => {
    mockedVerifyToken.mockReturnValueOnce(municipalManagerTokenPayload);
    mockedMunicipalityFindFirst.mockResolvedValueOnce(existingMunicipality);
    mockedSchoolCreate.mockResolvedValueOnce(existingSchool);

    const createSchoolRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/schools",
      {
        municipalityId: existingMunicipalityId,
        name: "Escola Municipal São Paulo",
        inepCode: "35000001",
      },
    );

    const createSchoolResponse = await POST(createSchoolRequest);

    expect(createSchoolResponse.status).toBe(201);
  });

  it("returns 401 without authentication", async () => {
    const createSchoolRequest = createUnauthenticatedRequest(
      "POST",
      "http://localhost/api/v1/schools",
      {
        municipalityId: existingMunicipalityId,
        name: "Escola",
        inepCode: "35000001",
      },
    );

    const createSchoolResponse = await POST(createSchoolRequest);
    const errorResponseData = await createSchoolResponse.json();

    expect(createSchoolResponse.status).toBe(401);
    expect(errorResponseData.error).toBe("Authentication required");
  });

  it("returns 403 for unauthorized roles", async () => {
    mockedVerifyToken.mockReturnValueOnce(teacherTokenPayload);

    const createSchoolRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/schools",
      {
        municipalityId: existingMunicipalityId,
        name: "Escola",
        inepCode: "35000001",
      },
    );

    const createSchoolResponse = await POST(createSchoolRequest);
    const errorResponseData = await createSchoolResponse.json();

    expect(createSchoolResponse.status).toBe(403);
    expect(errorResponseData.error).toBe("Forbidden");
  });
});

describe("GET /api/v1/schools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a list of schools", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindMany.mockResolvedValueOnce([existingSchool, secondSchool]);
    mockedSchoolCount.mockResolvedValueOnce(2);

    const listSchoolsRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/schools",
    );

    const listSchoolsResponse = await GET(listSchoolsRequest);
    const listSchoolsResponseData = await listSchoolsResponse.json();

    expect(listSchoolsResponse.status).toBe(200);
    expect(listSchoolsResponseData.data).toHaveLength(2);
    expect(listSchoolsResponseData.total).toBe(2);
  });

  it("filters schools by municipalityId", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindMany.mockResolvedValueOnce([existingSchool]);
    mockedSchoolCount.mockResolvedValueOnce(1);

    const listSchoolsRequest = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/schools?municipalityId=${existingMunicipalityId}`,
    );

    await GET(listSchoolsRequest);

    expect(mockedSchoolFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          municipalityId: existingMunicipalityId,
        }),
      }),
    );
  });

  it("filters schools by name search", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindMany.mockResolvedValueOnce([existingSchool]);
    mockedSchoolCount.mockResolvedValueOnce(1);

    const listSchoolsRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/schools?search=Municipal",
    );

    await GET(listSchoolsRequest);

    expect(mockedSchoolFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: { contains: "Municipal", mode: "insensitive" },
        }),
      }),
    );
  });

  it("only returns non-deleted schools", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindMany.mockResolvedValueOnce([]);
    mockedSchoolCount.mockResolvedValueOnce(0);

    const listSchoolsRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/schools",
    );

    await GET(listSchoolsRequest);

    expect(mockedSchoolFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ deletedAt: null }),
      }),
    );
  });

  it("supports pagination with page and perPage", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindMany.mockResolvedValueOnce([existingSchool]);
    mockedSchoolCount.mockResolvedValueOnce(50);

    const listSchoolsRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/schools?page=2&perPage=10",
    );

    await GET(listSchoolsRequest);

    expect(mockedSchoolFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
  });

  it("allows SCHOOL_MANAGER to list schools", async () => {
    mockedVerifyToken.mockReturnValueOnce(schoolManagerTokenPayload);
    mockedSchoolFindMany.mockResolvedValueOnce([]);
    mockedSchoolCount.mockResolvedValueOnce(0);

    const listSchoolsRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/schools",
    );

    const listSchoolsResponse = await GET(listSchoolsRequest);

    expect(listSchoolsResponse.status).toBe(200);
  });

  it("returns 401 without authentication", async () => {
    const listSchoolsRequest = createUnauthenticatedRequest(
      "GET",
      "http://localhost/api/v1/schools",
    );

    const listSchoolsResponse = await GET(listSchoolsRequest);

    expect(listSchoolsResponse.status).toBe(401);
  });
});

describe("GET /api/v1/schools/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a school by id", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(existingSchool);

    const getSchoolRequest = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/schools/${existingSchool.id}`,
    );

    const getSchoolResponse = await GET_BY_ID(getSchoolRequest, routeContext);
    const getSchoolResponseData = await getSchoolResponse.json();

    expect(getSchoolResponse.status).toBe(200);
    expect(getSchoolResponseData.id).toBe(existingSchool.id);
    expect(getSchoolResponseData.name).toBe("Escola Municipal São Paulo");
  });

  it("returns 404 when school does not exist", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(null);

    const getSchoolRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/schools/nonexistent-id",
    );

    const nonexistentRouteContext = {
      params: Promise.resolve({ id: "nonexistent-id" }),
    };

    const getSchoolResponse = await GET_BY_ID(
      getSchoolRequest,
      nonexistentRouteContext,
    );
    const errorResponseData = await getSchoolResponse.json();

    expect(getSchoolResponse.status).toBe(404);
    expect(errorResponseData.error).toBe("School not found");
  });

  it("does not return soft-deleted schools", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(null);

    const getSchoolRequest = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/schools/${existingSchool.id}`,
    );

    await GET_BY_ID(getSchoolRequest, routeContext);

    expect(mockedSchoolFindFirst).toHaveBeenCalledWith({
      where: { id: existingSchool.id, deletedAt: null },
    });
  });

  it("returns 401 without authentication", async () => {
    const getSchoolRequest = createUnauthenticatedRequest(
      "GET",
      `http://localhost/api/v1/schools/${existingSchool.id}`,
    );

    const getSchoolResponse = await GET_BY_ID(getSchoolRequest, routeContext);

    expect(getSchoolResponse.status).toBe(401);
  });
});

describe("PUT /api/v1/schools/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a school and returns 200", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(existingSchool);
    const updatedSchool = { ...existingSchool, name: "Escola Renomeada" };
    mockedSchoolUpdate.mockResolvedValueOnce(updatedSchool);

    const updateSchoolRequest = createAuthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/schools/${existingSchool.id}`,
      { name: "Escola Renomeada" },
    );

    const updateSchoolResponse = await PUT(updateSchoolRequest, routeContext);
    const updateSchoolResponseData = await updateSchoolResponse.json();

    expect(updateSchoolResponse.status).toBe(200);
    expect(updateSchoolResponseData.name).toBe("Escola Renomeada");
  });

  it("returns 404 when school does not exist", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(null);

    const updateSchoolRequest = createAuthenticatedRequest(
      "PUT",
      "http://localhost/api/v1/schools/nonexistent-id",
      { name: "Updated" },
    );

    const nonexistentRouteContext = {
      params: Promise.resolve({ id: "nonexistent-id" }),
    };

    const updateSchoolResponse = await PUT(
      updateSchoolRequest,
      nonexistentRouteContext,
    );
    const errorResponseData = await updateSchoolResponse.json();

    expect(updateSchoolResponse.status).toBe(404);
    expect(errorResponseData.error).toBe("School not found");
  });

  it("returns 400 when body is empty", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(existingSchool);

    const updateSchoolRequest = createAuthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/schools/${existingSchool.id}`,
      {},
    );

    const updateSchoolResponse = await PUT(updateSchoolRequest, routeContext);
    const errorResponseData = await updateSchoolResponse.json();

    expect(updateSchoolResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("returns 404 when updating municipalityId to nonexistent municipality", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(existingSchool);
    mockedMunicipalityFindFirst.mockResolvedValueOnce(null);

    const updateSchoolRequest = createAuthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/schools/${existingSchool.id}`,
      { municipalityId: "nonexistent-municipality-id" },
    );

    const updateSchoolResponse = await PUT(updateSchoolRequest, routeContext);
    const errorResponseData = await updateSchoolResponse.json();

    expect(updateSchoolResponse.status).toBe(404);
    expect(errorResponseData.error).toBe("Municipality not found");
  });

  it("returns 409 when updating to an existing inepCode", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(existingSchool);
    mockedSchoolUpdate.mockRejectedValueOnce({
      code: "P2002",
      meta: { target: ["inep_code"] },
    });

    const updateSchoolRequest = createAuthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/schools/${existingSchool.id}`,
      { inepCode: "35000002" },
    );

    const updateSchoolResponse = await PUT(updateSchoolRequest, routeContext);
    const errorResponseData = await updateSchoolResponse.json();

    expect(updateSchoolResponse.status).toBe(409);
    expect(errorResponseData.error).toBe(
      "School with this INEP code already exists",
    );
  });

  it("returns 401 without authentication", async () => {
    const updateSchoolRequest = createUnauthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/schools/${existingSchool.id}`,
      { name: "Updated" },
    );

    const updateSchoolResponse = await PUT(updateSchoolRequest, routeContext);

    expect(updateSchoolResponse.status).toBe(401);
  });

  it("returns 403 for unauthorized roles", async () => {
    mockedVerifyToken.mockReturnValueOnce(teacherTokenPayload);

    const updateSchoolRequest = createAuthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/schools/${existingSchool.id}`,
      { name: "Updated" },
    );

    const updateSchoolResponse = await PUT(updateSchoolRequest, routeContext);

    expect(updateSchoolResponse.status).toBe(403);
  });
});

describe("DELETE /api/v1/schools/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("soft deletes a school and returns 200", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(existingSchool);
    const softDeletedSchool = { ...existingSchool, deletedAt: new Date() };
    mockedSchoolUpdate.mockResolvedValueOnce(softDeletedSchool);

    const deleteSchoolRequest = createAuthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/schools/${existingSchool.id}`,
    );

    const deleteSchoolResponse = await DELETE(
      deleteSchoolRequest,
      routeContext,
    );
    const deleteSchoolResponseData = await deleteSchoolResponse.json();

    expect(deleteSchoolResponse.status).toBe(200);
    expect(deleteSchoolResponseData.message).toBe("School deleted");
  });

  it("returns 404 when school does not exist", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(null);

    const deleteSchoolRequest = createAuthenticatedRequest(
      "DELETE",
      "http://localhost/api/v1/schools/nonexistent-id",
    );

    const nonexistentRouteContext = {
      params: Promise.resolve({ id: "nonexistent-id" }),
    };

    const deleteSchoolResponse = await DELETE(
      deleteSchoolRequest,
      nonexistentRouteContext,
    );
    const errorResponseData = await deleteSchoolResponse.json();

    expect(deleteSchoolResponse.status).toBe(404);
    expect(errorResponseData.error).toBe("School not found");
  });

  it("uses soft delete (sets deletedAt) instead of hard delete", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedSchoolFindFirst.mockResolvedValueOnce(existingSchool);
    mockedSchoolUpdate.mockResolvedValueOnce({
      ...existingSchool,
      deletedAt: new Date(),
    });

    const deleteSchoolRequest = createAuthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/schools/${existingSchool.id}`,
    );

    await DELETE(deleteSchoolRequest, routeContext);

    expect(mockedSchoolUpdate).toHaveBeenCalledWith({
      where: { id: existingSchool.id },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it("returns 401 without authentication", async () => {
    const deleteSchoolRequest = createUnauthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/schools/${existingSchool.id}`,
    );

    const deleteSchoolResponse = await DELETE(
      deleteSchoolRequest,
      routeContext,
    );

    expect(deleteSchoolResponse.status).toBe(401);
  });

  it("returns 403 for unauthorized roles", async () => {
    mockedVerifyToken.mockReturnValueOnce(teacherTokenPayload);

    const deleteSchoolRequest = createAuthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/schools/${existingSchool.id}`,
    );

    const deleteSchoolResponse = await DELETE(
      deleteSchoolRequest,
      routeContext,
    );

    expect(deleteSchoolResponse.status).toBe(403);
  });
});
