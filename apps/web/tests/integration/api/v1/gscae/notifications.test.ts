import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    notification: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { GET } from "@/app/api/v1/(protected)/gscae/notifications/route";
import { PATCH as PATCH_BY_ID } from "@/app/api/v1/(protected)/gscae/notifications/[id]/route";
import { PATCH as PATCH_READ_ALL } from "@/app/api/v1/(protected)/gscae/notifications/read-all/route";

const mockedFindMany = vi.mocked(prisma.notification.findMany);
const mockedFindUnique = vi.mocked(prisma.notification.findUnique);
const mockedCount = vi.mocked(prisma.notification.count);
const mockedUpdate = vi.mocked(prisma.notification.update);
const mockedUpdateMany = vi.mocked(prisma.notification.updateMany);
const mockedVerifyToken = vi.mocked(verifyToken);

const BASE_URL = "http://localhost:3000/api/v1/gscae/notifications";

const studentPayload = {
  userId: "550e8400-e29b-41d4-a716-446655440000",
  role: "STUDENT" as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400,
};

const otherUserPayload = {
  ...studentPayload,
  userId: "660e8400-e29b-41d4-a716-446655440001",
};

function authRequest(method: string, url?: string, body?: unknown): Request {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid-token",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return new Request(url ?? BASE_URL, options);
}

function unauthRequest(method: string, url?: string): Request {
  return new Request(url ?? BASE_URL, {
    method,
    headers: { "Content-Type": "application/json" },
  });
}

const sampleNotification = {
  id: "notif-1",
  userId: studentPayload.userId,
  type: "badge_earned",
  title: "Nova conquista!",
  message: "Você ganhou o badge Explorador",
  data: { badgeId: "badge-1" },
  isRead: false,
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/v1/gscae/notifications", () => {
  it("should return 401 without authentication", async () => {
    const request = unauthRequest("GET");
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("should return paginated notifications with unread count", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedFindMany.mockResolvedValue([sampleNotification] as never);
    mockedCount
      .mockResolvedValueOnce(1 as never)
      .mockResolvedValueOnce(1 as never);

    const request = authRequest("GET");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.notifications).toHaveLength(1);
    expect(data.unreadCount).toBe(1);
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.pageSize).toBe(20);
    expect(data.pagination.total).toBe(1);
    expect(data.pagination.totalPages).toBe(1);
  });

  it("should filter by unreadOnly when param is true", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedFindMany.mockResolvedValue([] as never);
    mockedCount.mockResolvedValue(0 as never);

    const request = authRequest("GET", `${BASE_URL}?unreadOnly=true`);
    await GET(request);

    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: studentPayload.userId, isRead: false },
      }),
    );
  });

  it("should respect page and pageSize params", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedFindMany.mockResolvedValue([] as never);
    mockedCount.mockResolvedValue(50 as never);

    const request = authRequest("GET", `${BASE_URL}?page=3&pageSize=10`);
    const response = await GET(request);
    const data = await response.json();

    expect(data.pagination.page).toBe(3);
    expect(data.pagination.pageSize).toBe(10);
    expect(data.pagination.totalPages).toBe(5);
    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
  });

  it("should cap pageSize at 100", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedFindMany.mockResolvedValue([] as never);
    mockedCount.mockResolvedValue(0 as never);

    const request = authRequest("GET", `${BASE_URL}?pageSize=500`);
    const response = await GET(request);
    const data = await response.json();

    expect(data.pagination.pageSize).toBe(100);
  });

  it("should return empty list when no notifications exist", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedFindMany.mockResolvedValue([] as never);
    mockedCount.mockResolvedValue(0 as never);

    const request = authRequest("GET");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.notifications).toEqual([]);
    expect(data.unreadCount).toBe(0);
  });

  it("should only query notifications for the authenticated user", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedFindMany.mockResolvedValue([] as never);
    mockedCount.mockResolvedValue(0 as never);

    const request = authRequest("GET");
    await GET(request);

    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: studentPayload.userId,
        }),
      }),
    );
  });

  it("should not return notifications from another user", async () => {
    mockedVerifyToken.mockReturnValue(otherUserPayload);
    mockedFindMany.mockResolvedValue([] as never);
    mockedCount.mockResolvedValue(0 as never);

    const request = authRequest("GET");
    await GET(request);

    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: otherUserPayload.userId,
        }),
      }),
    );

    expect(mockedFindMany).not.toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: studentPayload.userId,
        }),
      }),
    );
  });

  it("should count unread only for the authenticated user", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedFindMany.mockResolvedValue([] as never);
    mockedCount.mockResolvedValue(0 as never);

    const request = authRequest("GET");
    await GET(request);

    const countCalls = mockedCount.mock.calls;
    const unreadCountCall = countCalls[1];
    expect(unreadCountCall[0]).toEqual({
      where: { userId: studentPayload.userId, isRead: false },
    });
  });

  it("should handle page=0 gracefully by defaulting to page 1", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedFindMany.mockResolvedValue([] as never);
    mockedCount.mockResolvedValue(0 as never);

    const request = authRequest("GET", `${BASE_URL}?page=0`);
    const response = await GET(request);
    const data = await response.json();

    expect(data.pagination.page).toBe(1);
    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0 }),
    );
  });

  it("should handle negative pageSize gracefully", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedFindMany.mockResolvedValue([] as never);
    mockedCount.mockResolvedValue(0 as never);

    const request = authRequest("GET", `${BASE_URL}?pageSize=-5`);
    const response = await GET(request);
    const data = await response.json();

    expect(data.pagination.pageSize).toBe(1);
  });

  it("should order notifications by createdAt descending", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedFindMany.mockResolvedValue([] as never);
    mockedCount.mockResolvedValue(0 as never);

    const request = authRequest("GET");
    await GET(request);

    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
      }),
    );
  });
});

describe("PATCH /api/v1/gscae/notifications/:id", () => {
  const notifUrl = `${BASE_URL}/notif-1`;
  const routeContext = {
    params: Promise.resolve({ id: "notif-1" }),
  };

  it("should return 401 without authentication", async () => {
    const request = unauthRequest("PATCH", notifUrl);
    const response = await PATCH_BY_ID(request);

    expect(response.status).toBe(401);
  });

  it("should return 404 when notification does not exist", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedFindUnique.mockResolvedValue(null);

    const request = authRequest("PATCH", notifUrl);
    const response = await PATCH_BY_ID(request, routeContext);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Notification not found");
  });

  it("should return 403 when notification belongs to another user", async () => {
    mockedVerifyToken.mockReturnValue(otherUserPayload);
    mockedFindUnique.mockResolvedValue({
      id: "notif-1",
      userId: studentPayload.userId,
      isRead: false,
    } as never);

    const request = authRequest("PATCH", notifUrl);
    const response = await PATCH_BY_ID(request, routeContext);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return alreadyRead when notification is already read", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedFindUnique.mockResolvedValue({
      id: "notif-1",
      userId: studentPayload.userId,
      isRead: true,
    } as never);

    const request = authRequest("PATCH", notifUrl);
    const response = await PATCH_BY_ID(request, routeContext);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.alreadyRead).toBe(true);
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it("should mark notification as read successfully", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedFindUnique.mockResolvedValue({
      id: "notif-1",
      userId: studentPayload.userId,
      isRead: false,
    } as never);
    mockedUpdate.mockResolvedValue({
      ...sampleNotification,
      isRead: true,
    } as never);

    const request = authRequest("PATCH", notifUrl);
    const response = await PATCH_BY_ID(request, routeContext);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.isRead).toBe(true);
    expect(mockedUpdate).toHaveBeenCalledWith({
      where: { id: "notif-1" },
      data: { isRead: true },
    });
  });

  it("should not allow marking another user notification via direct id access", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedFindUnique.mockResolvedValue({
      id: "notif-other",
      userId: otherUserPayload.userId,
      isRead: false,
    } as never);

    const otherRouteContext = {
      params: Promise.resolve({ id: "notif-other" }),
    };

    const request = authRequest("PATCH", `${BASE_URL}/notif-other`);
    const response = await PATCH_BY_ID(request, otherRouteContext);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it("should not update notification data other than isRead", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedFindUnique.mockResolvedValue({
      id: "notif-1",
      userId: studentPayload.userId,
      isRead: false,
    } as never);
    mockedUpdate.mockResolvedValue({
      ...sampleNotification,
      isRead: true,
    } as never);

    const request = authRequest("PATCH", notifUrl);
    await PATCH_BY_ID(request, routeContext);

    expect(mockedUpdate).toHaveBeenCalledWith({
      where: { id: "notif-1" },
      data: { isRead: true },
    });
  });
});

describe("PATCH /api/v1/gscae/notifications/read-all", () => {
  it("should return 401 without authentication", async () => {
    const request = unauthRequest("PATCH", `${BASE_URL}/read-all`);
    const response = await PATCH_READ_ALL(request);

    expect(response.status).toBe(401);
  });

  it("should mark all unread notifications as read", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedUpdateMany.mockResolvedValue({ count: 5 } as never);

    const request = authRequest("PATCH", `${BASE_URL}/read-all`);
    const response = await PATCH_READ_ALL(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.markedAsRead).toBe(5);
    expect(mockedUpdateMany).toHaveBeenCalledWith({
      where: { userId: studentPayload.userId, isRead: false },
      data: { isRead: true },
    });
  });

  it("should return 0 when no unread notifications exist", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedUpdateMany.mockResolvedValue({ count: 0 } as never);

    const request = authRequest("PATCH", `${BASE_URL}/read-all`);
    const response = await PATCH_READ_ALL(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.markedAsRead).toBe(0);
  });

  it("should only mark notifications of the authenticated user as read", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedUpdateMany.mockResolvedValue({ count: 3 } as never);

    const request = authRequest("PATCH", `${BASE_URL}/read-all`);
    await PATCH_READ_ALL(request);

    expect(mockedUpdateMany).toHaveBeenCalledWith({
      where: { userId: studentPayload.userId, isRead: false },
      data: { isRead: true },
    });

    expect(mockedUpdateMany).not.toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: otherUserPayload.userId,
        }),
      }),
    );
  });

  it("should not affect other user notifications when marking all as read", async () => {
    mockedVerifyToken.mockReturnValue(otherUserPayload);
    mockedUpdateMany.mockResolvedValue({ count: 1 } as never);

    const request = authRequest("PATCH", `${BASE_URL}/read-all`);
    await PATCH_READ_ALL(request);

    expect(mockedUpdateMany).toHaveBeenCalledWith({
      where: { userId: otherUserPayload.userId, isRead: false },
      data: { isRead: true },
    });
  });
});
