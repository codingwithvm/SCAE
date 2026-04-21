import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { POST } from "@/app/api/v1/(public)/auth/login/student/route";

const mockedFindFirstStudent = vi.mocked(prisma.user.findFirst);

function createStudentLoginRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/v1/auth/login/student", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const existingActiveStudent = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  role: "STUDENT" as const,
  name: "Maria Silva",
  email: null,
  registrationNumber: "2026001",
  birthDate: new Date("2015-03-10"),
  passwordHash: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe("POST /api/v1/auth/login/student", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 and a JWT token when credentials are valid", async () => {
    mockedFindFirstStudent.mockResolvedValueOnce(existingActiveStudent);

    const studentLoginRequest = createStudentLoginRequest({
      registrationNumber: "2026001",
      birthDate: "2015-03-10",
    });

    const loginResponse = await POST(studentLoginRequest);
    const loginResponseData = await loginResponse.json();

    expect(loginResponse.status).toBe(200);
    expect(loginResponseData.token).toBeDefined();
    expect(typeof loginResponseData.token).toBe("string");
  });

  it("returns user name and role in the response", async () => {
    mockedFindFirstStudent.mockResolvedValueOnce(existingActiveStudent);

    const studentLoginRequest = createStudentLoginRequest({
      registrationNumber: "2026001",
      birthDate: "2015-03-10",
    });

    const loginResponse = await POST(studentLoginRequest);
    const loginResponseData = await loginResponse.json();

    expect(loginResponseData.user.name).toBe("Maria Silva");
    expect(loginResponseData.user.role).toBe("STUDENT");
  });

  it("does not return sensitive fields in the response", async () => {
    mockedFindFirstStudent.mockResolvedValueOnce(existingActiveStudent);

    const studentLoginRequest = createStudentLoginRequest({
      registrationNumber: "2026001",
      birthDate: "2015-03-10",
    });

    const loginResponse = await POST(studentLoginRequest);
    const loginResponseData = await loginResponse.json();
    const serializedResponseBody = JSON.stringify(loginResponseData);

    expect(serializedResponseBody).not.toContain("passwordHash");
    expect(serializedResponseBody).not.toContain("deletedAt");
  });

  it("returns 401 when registration number does not exist", async () => {
    mockedFindFirstStudent.mockResolvedValueOnce(null);

    const studentLoginRequest = createStudentLoginRequest({
      registrationNumber: "9999999",
      birthDate: "2015-03-10",
    });

    const loginResponse = await POST(studentLoginRequest);
    const errorResponseData = await loginResponse.json();

    expect(loginResponse.status).toBe(401);
    expect(errorResponseData.error).toBe("Invalid credentials");
  });

  it("returns 401 when birth date does not match", async () => {
    mockedFindFirstStudent.mockResolvedValueOnce(null);

    const studentLoginRequest = createStudentLoginRequest({
      registrationNumber: "2026001",
      birthDate: "2000-01-01",
    });

    const loginResponse = await POST(studentLoginRequest);
    const errorResponseData = await loginResponse.json();

    expect(loginResponse.status).toBe(401);
    expect(errorResponseData.error).toBe("Invalid credentials");
  });

  it("returns 401 for soft-deleted students", async () => {
    mockedFindFirstStudent.mockResolvedValueOnce(null);

    const studentLoginRequest = createStudentLoginRequest({
      registrationNumber: "2026001",
      birthDate: "2015-03-10",
    });

    const loginResponse = await POST(studentLoginRequest);
    const errorResponseData = await loginResponse.json();

    expect(loginResponse.status).toBe(401);
    expect(errorResponseData.error).toBe("Invalid credentials");
  });

  it("returns 400 when registrationNumber is missing", async () => {
    const studentLoginRequest = createStudentLoginRequest({
      birthDate: "2015-03-10",
    });

    const loginResponse = await POST(studentLoginRequest);
    const errorResponseData = await loginResponse.json();

    expect(loginResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("returns 400 when birthDate is missing", async () => {
    const studentLoginRequest = createStudentLoginRequest({
      registrationNumber: "2026001",
    });

    const loginResponse = await POST(studentLoginRequest);
    const errorResponseData = await loginResponse.json();

    expect(loginResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("returns 400 when birthDate is not a valid date", async () => {
    const studentLoginRequest = createStudentLoginRequest({
      registrationNumber: "2026001",
      birthDate: "not-a-date",
    });

    const loginResponse = await POST(studentLoginRequest);
    const errorResponseData = await loginResponse.json();

    expect(loginResponse.status).toBe(400);
    expect(errorResponseData.error).toBeDefined();
  });

  it("does not reveal whether the registration number exists in error messages", async () => {
    mockedFindFirstStudent.mockResolvedValueOnce(null);

    const studentLoginRequest = createStudentLoginRequest({
      registrationNumber: "9999999",
      birthDate: "2015-03-10",
    });

    const loginResponse = await POST(studentLoginRequest);
    const errorResponseData = await loginResponse.json();

    expect(errorResponseData.error).toBe("Invalid credentials");
    expect(errorResponseData.error).not.toContain("not found");
    expect(errorResponseData.error).not.toContain("registration");
  });

  it("returns correct content-type header", async () => {
    mockedFindFirstStudent.mockResolvedValueOnce(existingActiveStudent);

    const studentLoginRequest = createStudentLoginRequest({
      registrationNumber: "2026001",
      birthDate: "2015-03-10",
    });

    const loginResponse = await POST(studentLoginRequest);

    expect(loginResponse.headers.get("content-type")).toContain(
      "application/json",
    );
  });

  it("queries only STUDENT role and non-deleted users", async () => {
    mockedFindFirstStudent.mockResolvedValueOnce(existingActiveStudent);

    const studentLoginRequest = createStudentLoginRequest({
      registrationNumber: "2026001",
      birthDate: "2015-03-10",
    });

    await POST(studentLoginRequest);

    expect(mockedFindFirstStudent).toHaveBeenCalledWith({
      where: {
        registrationNumber: "2026001",
        birthDate: new Date("2015-03-10"),
        role: "STUDENT",
        deletedAt: null,
      },
    });
  });
});
