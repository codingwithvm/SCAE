import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    activity: {
      findUnique: vi.fn(),
    },
    activitySession: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { POST } from "@/app/api/v1/(protected)/gscae/sessions/route";

const mockedActivityFindUnique = vi.mocked(prisma.activity.findUnique);
const mockedSessionCreate = vi.mocked(prisma.activitySession.create);
const mockedVerifyToken = vi.mocked(verifyToken);

const BASE_URL = "http://localhost:3000/api/v1/gscae/sessions";

const studentPayload = {
  userId: "550e8400-e29b-41d4-a716-446655440000",
  role: "STUDENT" as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400,
};

function authRequest(body: Record<string, unknown> = {}): Request {
  return new Request(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid-token",
    },
    body: JSON.stringify(body),
  });
}

function unauthRequest(): Request {
  return new Request(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activityId: "act-1" }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/v1/gscae/sessions", () => {
  it("should return 401 without authentication", async () => {
    const request = unauthRequest();
    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it("should return 403 for TEACHER role", async () => {
    const teacherPayload = { ...studentPayload, role: "TEACHER" as const };
    mockedVerifyToken.mockReturnValue(teacherPayload);

    const request = authRequest({ activityId: "act-1" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return 400 without activityId", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);

    const request = authRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("activityId is required");
  });

  it("should return 404 for non-existent activity", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedActivityFindUnique.mockResolvedValue(null as never);

    const request = authRequest({ activityId: "non-existent" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Activity not found");
  });

  it("should return 422 for inactive activity", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedActivityFindUnique.mockResolvedValue({
      id: "act-1",
      isActive: false,
      htmlContent: "<html>test</html>",
    } as never);

    const request = authRequest({ activityId: "act-1" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBe("Activity is not active");
  });

  it("should return 201 with session and htmlContent", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedActivityFindUnique.mockResolvedValue({
      id: "act-1",
      isActive: true,
      htmlContent: "<html>simulador</html>",
    } as never);

    const createdSession = {
      id: "session-1",
      activityId: "act-1",
      status: "started",
      createdAt: new Date("2026-05-20T10:00:00Z"),
    };
    mockedSessionCreate.mockResolvedValue(createdSession as never);

    const request = authRequest({ activityId: "act-1" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.session.id).toBe("session-1");
    expect(data.session.activityId).toBe("act-1");
    expect(data.session.status).toBe("started");
    expect(data.htmlContent).toBe("<html>simulador</html>");

    expect(mockedSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: studentPayload.userId,
          activityId: "act-1",
          status: "started",
        }),
      }),
    );
  });
});
