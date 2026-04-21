import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { verifyToken } from "@/lib/auth/jwt";
import { withAuth } from "@/lib/auth/middleware";
import type { Role } from "@/generated/prisma/client";

const mockedVerifyToken = vi.mocked(verifyToken);

function createAuthenticatedRequest(authorizationHeader?: string): Request {
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authorizationHeader) {
    requestHeaders["Authorization"] = authorizationHeader;
  }

  return new Request("http://localhost/api/v1/some-protected-route", {
    method: "GET",
    headers: requestHeaders,
  });
}

const validTeacherTokenPayload = {
  userId: "550e8400-e29b-41d4-a716-446655440000",
  role: "TEACHER" as Role,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400,
};

describe("withAuth middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the handler with decoded token when token is valid", async () => {
    mockedVerifyToken.mockReturnValueOnce(validTeacherTokenPayload);

    const protectedRouteHandler = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: "protected" }), { status: 200 }),
      );

    const authProtectedHandler = withAuth(protectedRouteHandler);
    const authenticatedRequest =
      createAuthenticatedRequest("Bearer valid-token");
    const authResponse = await authProtectedHandler(authenticatedRequest);

    expect(authResponse.status).toBe(200);
    expect(protectedRouteHandler).toHaveBeenCalledWith(
      authenticatedRequest,
      validTeacherTokenPayload,
      undefined,
    );
  });

  it("returns 401 when Authorization header is missing", async () => {
    const protectedRouteHandler = vi.fn();
    const authProtectedHandler = withAuth(protectedRouteHandler);
    const authenticatedRequest = createAuthenticatedRequest();

    const authResponse = await authProtectedHandler(authenticatedRequest);
    const errorResponseData = await authResponse.json();

    expect(authResponse.status).toBe(401);
    expect(errorResponseData.error).toBe("Authentication required");
    expect(protectedRouteHandler).not.toHaveBeenCalled();
  });

  it("returns 401 when Authorization header does not start with Bearer", async () => {
    const protectedRouteHandler = vi.fn();
    const authProtectedHandler = withAuth(protectedRouteHandler);
    const authenticatedRequest = createAuthenticatedRequest("Basic some-token");

    const authResponse = await authProtectedHandler(authenticatedRequest);
    const errorResponseData = await authResponse.json();

    expect(authResponse.status).toBe(401);
    expect(errorResponseData.error).toBe("Authentication required");
    expect(protectedRouteHandler).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", async () => {
    mockedVerifyToken.mockImplementationOnce(() => {
      throw new Error("invalid token");
    });

    const protectedRouteHandler = vi.fn();
    const authProtectedHandler = withAuth(protectedRouteHandler);
    const authenticatedRequest = createAuthenticatedRequest(
      "Bearer invalid-token",
    );

    const authResponse = await authProtectedHandler(authenticatedRequest);
    const errorResponseData = await authResponse.json();

    expect(authResponse.status).toBe(401);
    expect(errorResponseData.error).toBe("Invalid or expired token");
    expect(protectedRouteHandler).not.toHaveBeenCalled();
  });

  it("returns 401 when token is expired", async () => {
    mockedVerifyToken.mockImplementationOnce(() => {
      throw new Error("jwt expired");
    });

    const protectedRouteHandler = vi.fn();
    const authProtectedHandler = withAuth(protectedRouteHandler);
    const authenticatedRequest = createAuthenticatedRequest(
      "Bearer expired-token",
    );

    const authResponse = await authProtectedHandler(authenticatedRequest);
    const errorResponseData = await authResponse.json();

    expect(authResponse.status).toBe(401);
    expect(errorResponseData.error).toBe("Invalid or expired token");
    expect(protectedRouteHandler).not.toHaveBeenCalled();
  });

  it("does not expose internal error details", async () => {
    mockedVerifyToken.mockImplementationOnce(() => {
      throw new Error("some internal jwt library error with stack trace");
    });

    const protectedRouteHandler = vi.fn();
    const authProtectedHandler = withAuth(protectedRouteHandler);
    const authenticatedRequest = createAuthenticatedRequest("Bearer bad-token");

    const authResponse = await authProtectedHandler(authenticatedRequest);
    const errorResponseData = await authResponse.json();
    const serializedResponseBody = JSON.stringify(errorResponseData);

    expect(serializedResponseBody).not.toContain("stack");
    expect(serializedResponseBody).not.toContain("internal");
    expect(serializedResponseBody).not.toContain("library");
  });
});

describe("withAuth middleware with role restrictions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows access when user role is in the allowed list", async () => {
    mockedVerifyToken.mockReturnValueOnce(validTeacherTokenPayload);

    const protectedRouteHandler = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: "ok" }), { status: 200 }),
      );

    const authProtectedHandler = withAuth(protectedRouteHandler, {
      allowedRoles: ["TEACHER", "ADMIN"],
    });
    const authenticatedRequest =
      createAuthenticatedRequest("Bearer valid-token");
    const authResponse = await authProtectedHandler(authenticatedRequest);

    expect(authResponse.status).toBe(200);
    expect(protectedRouteHandler).toHaveBeenCalled();
  });

  it("returns 403 when user role is not in the allowed list", async () => {
    mockedVerifyToken.mockReturnValueOnce(validTeacherTokenPayload);

    const protectedRouteHandler = vi.fn();
    const authProtectedHandler = withAuth(protectedRouteHandler, {
      allowedRoles: ["ADMIN"],
    });
    const authenticatedRequest =
      createAuthenticatedRequest("Bearer valid-token");

    const authResponse = await authProtectedHandler(authenticatedRequest);
    const errorResponseData = await authResponse.json();

    expect(authResponse.status).toBe(403);
    expect(errorResponseData.error).toBe("Forbidden");
    expect(protectedRouteHandler).not.toHaveBeenCalled();
  });

  it("returns 403 when student tries to access staff-only route", async () => {
    const studentTokenPayload = {
      ...validTeacherTokenPayload,
      role: "STUDENT" as Role,
    };
    mockedVerifyToken.mockReturnValueOnce(studentTokenPayload);

    const protectedRouteHandler = vi.fn();
    const authProtectedHandler = withAuth(protectedRouteHandler, {
      allowedRoles: ["TEACHER", "SCHOOL_MANAGER", "MUNICIPAL_MANAGER", "ADMIN"],
    });
    const authenticatedRequest = createAuthenticatedRequest(
      "Bearer student-token",
    );

    const authResponse = await authProtectedHandler(authenticatedRequest);
    const errorResponseData = await authResponse.json();

    expect(authResponse.status).toBe(403);
    expect(errorResponseData.error).toBe("Forbidden");
  });

  it("allows any authenticated role when allowedRoles is not specified", async () => {
    mockedVerifyToken.mockReturnValueOnce(validTeacherTokenPayload);

    const protectedRouteHandler = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: "ok" }), { status: 200 }),
      );

    const authProtectedHandler = withAuth(protectedRouteHandler);
    const authenticatedRequest =
      createAuthenticatedRequest("Bearer valid-token");
    const authResponse = await authProtectedHandler(authenticatedRequest);

    expect(authResponse.status).toBe(200);
    expect(protectedRouteHandler).toHaveBeenCalled();
  });

  it("does not reveal the required role in the error message", async () => {
    mockedVerifyToken.mockReturnValueOnce(validTeacherTokenPayload);

    const protectedRouteHandler = vi.fn();
    const authProtectedHandler = withAuth(protectedRouteHandler, {
      allowedRoles: ["ADMIN"],
    });
    const authenticatedRequest =
      createAuthenticatedRequest("Bearer valid-token");

    const authResponse = await authProtectedHandler(authenticatedRequest);
    const errorResponseData = await authResponse.json();
    const serializedResponseBody = JSON.stringify(errorResponseData);

    expect(serializedResponseBody).not.toContain("ADMIN");
    expect(serializedResponseBody).not.toContain("TEACHER");
    expect(serializedResponseBody).not.toContain("role");
  });
});
