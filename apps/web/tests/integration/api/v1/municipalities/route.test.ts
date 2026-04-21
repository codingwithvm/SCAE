import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    municipality: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { GET, POST } from "@/app/api/v1/(protected)/municipalities/route";
import {
  GET as GET_BY_ID,
  PUT,
  DELETE,
} from "@/app/api/v1/(protected)/municipalities/[id]/route";

const mockedMunicipalityCreate = vi.mocked(prisma.municipality.create);
const mockedMunicipalityFindMany = vi.mocked(prisma.municipality.findMany);
const mockedMunicipalityFindFirst = vi.mocked(prisma.municipality.findFirst);
const mockedMunicipalityUpdate = vi.mocked(prisma.municipality.update);
const mockedMunicipalityCount = vi.mocked(prisma.municipality.count);
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

const teacherTokenPayload = {
  ...adminTokenPayload,
  userId: "770e8400-e29b-41d4-a716-446655440002",
  role: "TEACHER" as const,
};

const existingMunicipality = {
  id: "aaa00000-0000-0000-0000-000000000001",
  name: "São Paulo",
  state: "SP",
  ibgeCode: "3550308",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  deletedAt: null,
};

const secondMunicipality = {
  id: "bbb00000-0000-0000-0000-000000000002",
  name: "Rio de Janeiro",
  state: "RJ",
  ibgeCode: "3304557",
  createdAt: new Date("2026-01-02T00:00:00Z"),
  updatedAt: new Date("2026-01-02T00:00:00Z"),
  deletedAt: null,
};

const routeContext = {
  params: Promise.resolve({ id: existingMunicipality.id }),
};

describe("POST /api/v1/municipalities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a municipality and returns 201", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityCreate.mockResolvedValueOnce(existingMunicipality);

    const createMunicipalityRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/municipalities",
      { name: "São Paulo", state: "SP", ibgeCode: "3550308" },
    );

    const createMunicipalityResponse = await POST(createMunicipalityRequest);
    const createMunicipalityResponseData =
      await createMunicipalityResponse.json();

    expect(createMunicipalityResponse.status).toBe(201);
    expect(createMunicipalityResponseData.id).toBe(existingMunicipality.id);
    expect(createMunicipalityResponseData.name).toBe("São Paulo");
    expect(createMunicipalityResponseData.state).toBe("SP");
    expect(createMunicipalityResponseData.ibgeCode).toBe("3550308");
  });

  it("returns 400 when name is missing", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const createMunicipalityRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/municipalities",
      { state: "SP", ibgeCode: "3550308" },
    );

    const createMunicipalityResponse = await POST(createMunicipalityRequest);
    const errorResponseData = await createMunicipalityResponse.json();

    expect(createMunicipalityResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("returns 400 when state is missing", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const createMunicipalityRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/municipalities",
      { name: "São Paulo", ibgeCode: "3550308" },
    );

    const createMunicipalityResponse = await POST(createMunicipalityRequest);
    const errorResponseData = await createMunicipalityResponse.json();

    expect(createMunicipalityResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("returns 400 when ibgeCode is missing", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const createMunicipalityRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/municipalities",
      { name: "São Paulo", state: "SP" },
    );

    const createMunicipalityResponse = await POST(createMunicipalityRequest);
    const errorResponseData = await createMunicipalityResponse.json();

    expect(createMunicipalityResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("returns 400 when state is not 2 characters", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);

    const createMunicipalityRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/municipalities",
      { name: "São Paulo", state: "SPP", ibgeCode: "3550308" },
    );

    const createMunicipalityResponse = await POST(createMunicipalityRequest);
    const errorResponseData = await createMunicipalityResponse.json();

    expect(createMunicipalityResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("returns 409 when ibgeCode already exists", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityCreate.mockRejectedValueOnce({
      code: "P2002",
      meta: { target: ["ibge_code"] },
    });

    const createMunicipalityRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/municipalities",
      { name: "São Paulo", state: "SP", ibgeCode: "3550308" },
    );

    const createMunicipalityResponse = await POST(createMunicipalityRequest);
    const errorResponseData = await createMunicipalityResponse.json();

    expect(createMunicipalityResponse.status).toBe(409);
    expect(errorResponseData.error).toBe(
      "Municipality with this IBGE code already exists",
    );
  });

  it("allows MUNICIPAL_MANAGER to create municipalities", async () => {
    mockedVerifyToken.mockReturnValueOnce(municipalManagerTokenPayload);
    mockedMunicipalityCreate.mockResolvedValueOnce(existingMunicipality);

    const createMunicipalityRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/municipalities",
      { name: "São Paulo", state: "SP", ibgeCode: "3550308" },
    );

    const createMunicipalityResponse = await POST(createMunicipalityRequest);

    expect(createMunicipalityResponse.status).toBe(201);
  });

  it("returns 401 without authentication", async () => {
    const createMunicipalityRequest = createUnauthenticatedRequest(
      "POST",
      "http://localhost/api/v1/municipalities",
      { name: "São Paulo", state: "SP", ibgeCode: "3550308" },
    );

    const createMunicipalityResponse = await POST(createMunicipalityRequest);
    const errorResponseData = await createMunicipalityResponse.json();

    expect(createMunicipalityResponse.status).toBe(401);
    expect(errorResponseData.error).toBe("Authentication required");
  });

  it("returns 403 for unauthorized roles", async () => {
    mockedVerifyToken.mockReturnValueOnce(teacherTokenPayload);

    const createMunicipalityRequest = createAuthenticatedRequest(
      "POST",
      "http://localhost/api/v1/municipalities",
      { name: "São Paulo", state: "SP", ibgeCode: "3550308" },
    );

    const createMunicipalityResponse = await POST(createMunicipalityRequest);
    const errorResponseData = await createMunicipalityResponse.json();

    expect(createMunicipalityResponse.status).toBe(403);
    expect(errorResponseData.error).toBe("Forbidden");
  });
});

describe("GET /api/v1/municipalities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a list of municipalities", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindMany.mockResolvedValueOnce([
      existingMunicipality,
      secondMunicipality,
    ]);
    mockedMunicipalityCount.mockResolvedValueOnce(2);

    const listMunicipalitiesRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/municipalities",
    );

    const listMunicipalitiesResponse = await GET(listMunicipalitiesRequest);
    const listMunicipalitiesResponseData =
      await listMunicipalitiesResponse.json();

    expect(listMunicipalitiesResponse.status).toBe(200);
    expect(listMunicipalitiesResponseData.data).toHaveLength(2);
    expect(listMunicipalitiesResponseData.total).toBe(2);
  });

  it("filters municipalities by state", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindMany.mockResolvedValueOnce([existingMunicipality]);
    mockedMunicipalityCount.mockResolvedValueOnce(1);

    const listMunicipalitiesRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/municipalities?state=SP",
    );

    await GET(listMunicipalitiesRequest);

    expect(mockedMunicipalityFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ state: "SP" }),
      }),
    );
  });

  it("filters municipalities by name search", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindMany.mockResolvedValueOnce([existingMunicipality]);
    mockedMunicipalityCount.mockResolvedValueOnce(1);

    const listMunicipalitiesRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/municipalities?search=Paulo",
    );

    await GET(listMunicipalitiesRequest);

    expect(mockedMunicipalityFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: { contains: "Paulo", mode: "insensitive" },
        }),
      }),
    );
  });

  it("only returns non-deleted municipalities", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindMany.mockResolvedValueOnce([]);
    mockedMunicipalityCount.mockResolvedValueOnce(0);

    const listMunicipalitiesRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/municipalities",
    );

    await GET(listMunicipalitiesRequest);

    expect(mockedMunicipalityFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ deletedAt: null }),
      }),
    );
  });

  it("supports pagination with page and perPage", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindMany.mockResolvedValueOnce([existingMunicipality]);
    mockedMunicipalityCount.mockResolvedValueOnce(50);

    const listMunicipalitiesRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/municipalities?page=2&perPage=10",
    );

    await GET(listMunicipalitiesRequest);

    expect(mockedMunicipalityFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
  });

  it("returns 401 without authentication", async () => {
    const listMunicipalitiesRequest = createUnauthenticatedRequest(
      "GET",
      "http://localhost/api/v1/municipalities",
    );

    const listMunicipalitiesResponse = await GET(listMunicipalitiesRequest);

    expect(listMunicipalitiesResponse.status).toBe(401);
  });
});

describe("GET /api/v1/municipalities/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a municipality by id", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindFirst.mockResolvedValueOnce(existingMunicipality);

    const getMunicipalityRequest = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/municipalities/${existingMunicipality.id}`,
    );

    const getMunicipalityResponse = await GET_BY_ID(
      getMunicipalityRequest,
      routeContext,
    );
    const getMunicipalityResponseData = await getMunicipalityResponse.json();

    expect(getMunicipalityResponse.status).toBe(200);
    expect(getMunicipalityResponseData.id).toBe(existingMunicipality.id);
    expect(getMunicipalityResponseData.name).toBe("São Paulo");
  });

  it("returns 404 when municipality does not exist", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindFirst.mockResolvedValueOnce(null);

    const getMunicipalityRequest = createAuthenticatedRequest(
      "GET",
      "http://localhost/api/v1/municipalities/nonexistent-id",
    );

    const nonexistentRouteContext = {
      params: Promise.resolve({ id: "nonexistent-id" }),
    };

    const getMunicipalityResponse = await GET_BY_ID(
      getMunicipalityRequest,
      nonexistentRouteContext,
    );
    const errorResponseData = await getMunicipalityResponse.json();

    expect(getMunicipalityResponse.status).toBe(404);
    expect(errorResponseData.error).toBe("Municipality not found");
  });

  it("does not return soft-deleted municipalities", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindFirst.mockResolvedValueOnce(null);

    const getMunicipalityRequest = createAuthenticatedRequest(
      "GET",
      `http://localhost/api/v1/municipalities/${existingMunicipality.id}`,
    );

    await GET_BY_ID(getMunicipalityRequest, routeContext);

    expect(mockedMunicipalityFindFirst).toHaveBeenCalledWith({
      where: { id: existingMunicipality.id, deletedAt: null },
    });
  });

  it("returns 401 without authentication", async () => {
    const getMunicipalityRequest = createUnauthenticatedRequest(
      "GET",
      `http://localhost/api/v1/municipalities/${existingMunicipality.id}`,
    );

    const getMunicipalityResponse = await GET_BY_ID(
      getMunicipalityRequest,
      routeContext,
    );

    expect(getMunicipalityResponse.status).toBe(401);
  });
});

describe("PUT /api/v1/municipalities/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a municipality and returns 200", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindFirst.mockResolvedValueOnce(existingMunicipality);
    const updatedMunicipality = {
      ...existingMunicipality,
      name: "São Paulo Capital",
    };
    mockedMunicipalityUpdate.mockResolvedValueOnce(updatedMunicipality);

    const updateMunicipalityRequest = createAuthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/municipalities/${existingMunicipality.id}`,
      { name: "São Paulo Capital" },
    );

    const updateMunicipalityResponse = await PUT(
      updateMunicipalityRequest,
      routeContext,
    );
    const updateMunicipalityResponseData =
      await updateMunicipalityResponse.json();

    expect(updateMunicipalityResponse.status).toBe(200);
    expect(updateMunicipalityResponseData.name).toBe("São Paulo Capital");
  });

  it("returns 404 when municipality does not exist", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindFirst.mockResolvedValueOnce(null);

    const updateMunicipalityRequest = createAuthenticatedRequest(
      "PUT",
      "http://localhost/api/v1/municipalities/nonexistent-id",
      { name: "Updated" },
    );

    const nonexistentRouteContext = {
      params: Promise.resolve({ id: "nonexistent-id" }),
    };

    const updateMunicipalityResponse = await PUT(
      updateMunicipalityRequest,
      nonexistentRouteContext,
    );
    const errorResponseData = await updateMunicipalityResponse.json();

    expect(updateMunicipalityResponse.status).toBe(404);
    expect(errorResponseData.error).toBe("Municipality not found");
  });

  it("returns 400 when state is not 2 characters", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindFirst.mockResolvedValueOnce(existingMunicipality);

    const updateMunicipalityRequest = createAuthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/municipalities/${existingMunicipality.id}`,
      { state: "SPP" },
    );

    const updateMunicipalityResponse = await PUT(
      updateMunicipalityRequest,
      routeContext,
    );
    const errorResponseData = await updateMunicipalityResponse.json();

    expect(updateMunicipalityResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("returns 409 when updating to an existing ibgeCode", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindFirst.mockResolvedValueOnce(existingMunicipality);
    mockedMunicipalityUpdate.mockRejectedValueOnce({
      code: "P2002",
      meta: { target: ["ibge_code"] },
    });

    const updateMunicipalityRequest = createAuthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/municipalities/${existingMunicipality.id}`,
      { ibgeCode: "3304557" },
    );

    const updateMunicipalityResponse = await PUT(
      updateMunicipalityRequest,
      routeContext,
    );
    const errorResponseData = await updateMunicipalityResponse.json();

    expect(updateMunicipalityResponse.status).toBe(409);
    expect(errorResponseData.error).toBe(
      "Municipality with this IBGE code already exists",
    );
  });

  it("returns 400 when body is empty", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindFirst.mockResolvedValueOnce(existingMunicipality);

    const updateMunicipalityRequest = createAuthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/municipalities/${existingMunicipality.id}`,
      {},
    );

    const updateMunicipalityResponse = await PUT(
      updateMunicipalityRequest,
      routeContext,
    );
    const errorResponseData = await updateMunicipalityResponse.json();

    expect(updateMunicipalityResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("returns 401 without authentication", async () => {
    const updateMunicipalityRequest = createUnauthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/municipalities/${existingMunicipality.id}`,
      { name: "Updated" },
    );

    const updateMunicipalityResponse = await PUT(
      updateMunicipalityRequest,
      routeContext,
    );

    expect(updateMunicipalityResponse.status).toBe(401);
  });

  it("returns 403 for unauthorized roles", async () => {
    mockedVerifyToken.mockReturnValueOnce(teacherTokenPayload);

    const updateMunicipalityRequest = createAuthenticatedRequest(
      "PUT",
      `http://localhost/api/v1/municipalities/${existingMunicipality.id}`,
      { name: "Updated" },
    );

    const updateMunicipalityResponse = await PUT(
      updateMunicipalityRequest,
      routeContext,
    );

    expect(updateMunicipalityResponse.status).toBe(403);
  });
});

describe("DELETE /api/v1/municipalities/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("soft deletes a municipality and returns 200", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindFirst.mockResolvedValueOnce(existingMunicipality);
    const softDeletedMunicipality = {
      ...existingMunicipality,
      deletedAt: new Date(),
    };
    mockedMunicipalityUpdate.mockResolvedValueOnce(softDeletedMunicipality);

    const deleteMunicipalityRequest = createAuthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/municipalities/${existingMunicipality.id}`,
    );

    const deleteMunicipalityResponse = await DELETE(
      deleteMunicipalityRequest,
      routeContext,
    );
    const deleteMunicipalityResponseData =
      await deleteMunicipalityResponse.json();

    expect(deleteMunicipalityResponse.status).toBe(200);
    expect(deleteMunicipalityResponseData.message).toBe("Municipality deleted");
  });

  it("returns 404 when municipality does not exist", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindFirst.mockResolvedValueOnce(null);

    const deleteMunicipalityRequest = createAuthenticatedRequest(
      "DELETE",
      "http://localhost/api/v1/municipalities/nonexistent-id",
    );

    const nonexistentRouteContext = {
      params: Promise.resolve({ id: "nonexistent-id" }),
    };

    const deleteMunicipalityResponse = await DELETE(
      deleteMunicipalityRequest,
      nonexistentRouteContext,
    );
    const errorResponseData = await deleteMunicipalityResponse.json();

    expect(deleteMunicipalityResponse.status).toBe(404);
    expect(errorResponseData.error).toBe("Municipality not found");
  });

  it("uses soft delete (sets deletedAt) instead of hard delete", async () => {
    mockedVerifyToken.mockReturnValueOnce(adminTokenPayload);
    mockedMunicipalityFindFirst.mockResolvedValueOnce(existingMunicipality);
    mockedMunicipalityUpdate.mockResolvedValueOnce({
      ...existingMunicipality,
      deletedAt: new Date(),
    });

    const deleteMunicipalityRequest = createAuthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/municipalities/${existingMunicipality.id}`,
    );

    await DELETE(deleteMunicipalityRequest, routeContext);

    expect(mockedMunicipalityUpdate).toHaveBeenCalledWith({
      where: { id: existingMunicipality.id },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it("returns 401 without authentication", async () => {
    const deleteMunicipalityRequest = createUnauthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/municipalities/${existingMunicipality.id}`,
    );

    const deleteMunicipalityResponse = await DELETE(
      deleteMunicipalityRequest,
      routeContext,
    );

    expect(deleteMunicipalityResponse.status).toBe(401);
  });

  it("returns 403 for unauthorized roles", async () => {
    mockedVerifyToken.mockReturnValueOnce(teacherTokenPayload);

    const deleteMunicipalityRequest = createAuthenticatedRequest(
      "DELETE",
      `http://localhost/api/v1/municipalities/${existingMunicipality.id}`,
    );

    const deleteMunicipalityResponse = await DELETE(
      deleteMunicipalityRequest,
      routeContext,
    );

    expect(deleteMunicipalityResponse.status).toBe(403);
  });
});
