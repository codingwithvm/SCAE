import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/password", () => ({
  comparePassword: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth/password";
import { POST } from "@/app/api/v1/(public)/auth/login/staff/route";

const mockedFindFirstStaffMember = vi.mocked(prisma.user.findFirst);
const mockedComparePassword = vi.mocked(comparePassword);

function createStaffLoginRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/v1/auth/login/staff", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const existingActiveTeacher = {
  id: "660e8400-e29b-41d4-a716-446655440001",
  role: "TEACHER" as const,
  name: "Carlos Oliveira",
  email: "carlos@escola.edu.br",
  registrationNumber: null,
  birthDate: null,
  passwordHash: "$2b$12$hashedpasswordhere",
  schoolId: null,
  municipalityId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const existingActiveSchoolManager = {
  ...existingActiveTeacher,
  id: "770e8400-e29b-41d4-a716-446655440002",
  role: "SCHOOL_MANAGER" as const,
  name: "Ana Gestora",
  email: "ana@escola.edu.br",
};

const existingActiveAdmin = {
  ...existingActiveTeacher,
  id: "880e8400-e29b-41d4-a716-446655440003",
  role: "ADMIN" as const,
  name: "Root Admin",
  email: "admin@scae.gov.br",
};

describe("POST /api/v1/auth/login/staff", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 and a JWT token for a teacher with valid credentials", async () => {
    mockedFindFirstStaffMember.mockResolvedValueOnce(existingActiveTeacher);
    mockedComparePassword.mockResolvedValueOnce(true);

    const staffLoginRequest = createStaffLoginRequest({
      email: "carlos@escola.edu.br",
      password: "senhaSegura123",
    });

    const loginResponse = await POST(staffLoginRequest);
    const loginResponseData = await loginResponse.json();

    expect(loginResponse.status).toBe(200);
    expect(loginResponseData.token).toBeDefined();
    expect(typeof loginResponseData.token).toBe("string");
  });

  it("returns user name and role in the response", async () => {
    mockedFindFirstStaffMember.mockResolvedValueOnce(existingActiveTeacher);
    mockedComparePassword.mockResolvedValueOnce(true);

    const staffLoginRequest = createStaffLoginRequest({
      email: "carlos@escola.edu.br",
      password: "senhaSegura123",
    });

    const loginResponse = await POST(staffLoginRequest);
    const loginResponseData = await loginResponse.json();

    expect(loginResponseData.user.name).toBe("Carlos Oliveira");
    expect(loginResponseData.user.role).toBe("TEACHER");
  });

  it("authenticates school managers successfully", async () => {
    mockedFindFirstStaffMember.mockResolvedValueOnce(
      existingActiveSchoolManager,
    );
    mockedComparePassword.mockResolvedValueOnce(true);

    const staffLoginRequest = createStaffLoginRequest({
      email: "ana@escola.edu.br",
      password: "senhaSegura123",
    });

    const loginResponse = await POST(staffLoginRequest);
    const loginResponseData = await loginResponse.json();

    expect(loginResponse.status).toBe(200);
    expect(loginResponseData.user.role).toBe("SCHOOL_MANAGER");
  });

  it("authenticates admins successfully", async () => {
    mockedFindFirstStaffMember.mockResolvedValueOnce(existingActiveAdmin);
    mockedComparePassword.mockResolvedValueOnce(true);

    const staffLoginRequest = createStaffLoginRequest({
      email: "admin@scae.gov.br",
      password: "senhaSegura123",
    });

    const loginResponse = await POST(staffLoginRequest);
    const loginResponseData = await loginResponse.json();

    expect(loginResponse.status).toBe(200);
    expect(loginResponseData.user.role).toBe("ADMIN");
  });

  it("does not return sensitive fields in the response", async () => {
    mockedFindFirstStaffMember.mockResolvedValueOnce(existingActiveTeacher);
    mockedComparePassword.mockResolvedValueOnce(true);

    const staffLoginRequest = createStaffLoginRequest({
      email: "carlos@escola.edu.br",
      password: "senhaSegura123",
    });

    const loginResponse = await POST(staffLoginRequest);
    const loginResponseData = await loginResponse.json();
    const serializedResponseBody = JSON.stringify(loginResponseData);

    expect(serializedResponseBody).not.toContain("passwordHash");
    expect(serializedResponseBody).not.toContain("deletedAt");
    expect(serializedResponseBody).not.toContain("$2b$");
  });

  it("returns 401 when email does not exist", async () => {
    mockedFindFirstStaffMember.mockResolvedValueOnce(null);

    const staffLoginRequest = createStaffLoginRequest({
      email: "inexistente@escola.edu.br",
      password: "senhaSegura123",
    });

    const loginResponse = await POST(staffLoginRequest);
    const errorResponseData = await loginResponse.json();

    expect(loginResponse.status).toBe(401);
    expect(errorResponseData.error).toBe("Invalid credentials");
  });

  it("returns 401 when password is incorrect", async () => {
    mockedFindFirstStaffMember.mockResolvedValueOnce(existingActiveTeacher);
    mockedComparePassword.mockResolvedValueOnce(false);

    const staffLoginRequest = createStaffLoginRequest({
      email: "carlos@escola.edu.br",
      password: "senhaErrada",
    });

    const loginResponse = await POST(staffLoginRequest);
    const errorResponseData = await loginResponse.json();

    expect(loginResponse.status).toBe(401);
    expect(errorResponseData.error).toBe("Invalid credentials");
  });

  it("returns 401 for soft-deleted users", async () => {
    mockedFindFirstStaffMember.mockResolvedValueOnce(null);

    const staffLoginRequest = createStaffLoginRequest({
      email: "carlos@escola.edu.br",
      password: "senhaSegura123",
    });

    const loginResponse = await POST(staffLoginRequest);
    const errorResponseData = await loginResponse.json();

    expect(loginResponse.status).toBe(401);
    expect(errorResponseData.error).toBe("Invalid credentials");
  });

  it("returns 400 when email is missing", async () => {
    const staffLoginRequest = createStaffLoginRequest({
      password: "senhaSegura123",
    });

    const loginResponse = await POST(staffLoginRequest);
    const errorResponseData = await loginResponse.json();

    expect(loginResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("returns 400 when password is missing", async () => {
    const staffLoginRequest = createStaffLoginRequest({
      email: "carlos@escola.edu.br",
    });

    const loginResponse = await POST(staffLoginRequest);
    const errorResponseData = await loginResponse.json();

    expect(loginResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("does not reveal whether the email exists in error messages", async () => {
    mockedFindFirstStaffMember.mockResolvedValueOnce(null);

    const staffLoginRequest = createStaffLoginRequest({
      email: "inexistente@escola.edu.br",
      password: "senhaSegura123",
    });

    const loginResponse = await POST(staffLoginRequest);
    const errorResponseData = await loginResponse.json();

    expect(errorResponseData.error).toBe("Invalid credentials");
    expect(errorResponseData.error).not.toContain("not found");
    expect(errorResponseData.error).not.toContain("email");
  });

  it("queries only non-STUDENT roles and non-deleted users", async () => {
    mockedFindFirstStaffMember.mockResolvedValueOnce(existingActiveTeacher);
    mockedComparePassword.mockResolvedValueOnce(true);

    const staffLoginRequest = createStaffLoginRequest({
      email: "carlos@escola.edu.br",
      password: "senhaSegura123",
    });

    await POST(staffLoginRequest);

    expect(mockedFindFirstStaffMember).toHaveBeenCalledWith({
      where: {
        email: "carlos@escola.edu.br",
        role: { not: "STUDENT" },
        deletedAt: null,
      },
    });
  });

  it("returns correct content-type header", async () => {
    mockedFindFirstStaffMember.mockResolvedValueOnce(existingActiveTeacher);
    mockedComparePassword.mockResolvedValueOnce(true);

    const staffLoginRequest = createStaffLoginRequest({
      email: "carlos@escola.edu.br",
      password: "senhaSegura123",
    });

    const loginResponse = await POST(staffLoginRequest);

    expect(loginResponse.headers.get("content-type")).toContain(
      "application/json",
    );
  });

  it("returns 401 when user has no password hash set", async () => {
    const teacherWithoutPasswordHash = {
      ...existingActiveTeacher,
      passwordHash: null,
    };
    mockedFindFirstStaffMember.mockResolvedValueOnce(
      teacherWithoutPasswordHash,
    );

    const staffLoginRequest = createStaffLoginRequest({
      email: "carlos@escola.edu.br",
      password: "senhaSegura123",
    });

    const loginResponse = await POST(staffLoginRequest);
    const errorResponseData = await loginResponse.json();

    expect(loginResponse.status).toBe(401);
    expect(errorResponseData.error).toBe("Invalid credentials");
  });
});
