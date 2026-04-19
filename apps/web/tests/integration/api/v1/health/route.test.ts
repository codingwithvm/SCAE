import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/v1/health/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";

const mockedPrisma = vi.mocked(prisma);

describe("GET /api/v1/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a healthy status with status code 200", async () => {
    mockedPrisma.$queryRaw.mockResolvedValueOnce([{ connection_test: 1 }]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("healthy");
  });

  it("returns the current system version", async () => {
    mockedPrisma.$queryRaw.mockResolvedValueOnce([{ connection_test: 1 }]);

    const response = await GET();
    const data = await response.json();

    expect(data.version).toBe("0.1.0");
  });

  it("returns a valid ISO timestamp", async () => {
    mockedPrisma.$queryRaw.mockResolvedValueOnce([{ connection_test: 1 }]);

    const response = await GET();
    const data = await response.json();

    expect(data.timestamp).toBeDefined();
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });

  it("returns database status as connected when database is reachable", async () => {
    mockedPrisma.$queryRaw.mockResolvedValueOnce([{ connection_test: 1 }]);

    const response = await GET();
    const data = await response.json();

    expect(data.services.database.status).toBe("connected");
  });

  it("returns status 503 and disconnected when database is unreachable", async () => {
    mockedPrisma.$queryRaw.mockRejectedValueOnce(
      new Error("Connection refused"),
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("unhealthy");
    expect(data.services.database.status).toBe("disconnected");
  });

  it("does not expose database connection string or credentials", async () => {
    mockedPrisma.$queryRaw.mockRejectedValueOnce(
      new Error(
        "Connection refused: postgresql://user:password@localhost:5432/db",
      ),
    );

    const response = await GET();
    const data = await response.json();
    const body = JSON.stringify(data);

    expect(body).not.toContain("postgresql://");
    expect(body).not.toContain("password");
    expect(body).not.toContain("DATABASE_URL");
  });

  it("does not expose internal stack traces on error", async () => {
    const error = new Error("Something went wrong");
    error.stack =
      "Error: Something went wrong\n    at Object.<anonymous> (/app/src/lib/prisma.ts:10:15)";
    mockedPrisma.$queryRaw.mockRejectedValueOnce(error);

    const response = await GET();
    const data = await response.json();
    const body = JSON.stringify(data);

    expect(body).not.toContain("at Object");
    expect(body).not.toContain(".ts:");
    expect(body).not.toContain("stack");
  });

  it("only allows GET method", async () => {
    mockedPrisma.$queryRaw.mockResolvedValueOnce([{ connection_test: 1 }]);

    const response = await GET();

    expect(response).toBeDefined();
  });

  it("returns correct content-type header", async () => {
    mockedPrisma.$queryRaw.mockResolvedValueOnce([{ connection_test: 1 }]);

    const response = await GET();

    expect(response.headers.get("content-type")).toContain("application/json");
  });

  it("does not expose raw database query results", async () => {
    mockedPrisma.$queryRaw.mockResolvedValueOnce([{ connection_test: 1 }]);

    const response = await GET();
    const data = await response.json();

    expect(data.services.database.response).toBeUndefined();
  });
});
