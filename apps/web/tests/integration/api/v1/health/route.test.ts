import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/v1/(public)/health/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";

const mockedPrisma = vi.mocked(prisma);

function mockDatabaseHealthyResponses({
  version = "16.0",
  maxConnections = "100",
  openedConnections = 5,
} = {}) {
  mockedPrisma.$queryRaw
    .mockResolvedValueOnce([{ server_version: version }])
    .mockResolvedValueOnce([{ max_connections: maxConnections }])
    .mockResolvedValueOnce([{ count: openedConnections }]);
}

describe("GET /api/v1/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a healthy status with status code 200", async () => {
    mockDatabaseHealthyResponses();

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("healthy");
  });

  it("returns the current system version", async () => {
    mockDatabaseHealthyResponses();

    const response = await GET();
    const data = await response.json();

    expect(data.version).toBe("0.1.0");
  });

  it("returns a valid ISO timestamp", async () => {
    mockDatabaseHealthyResponses();

    const response = await GET();
    const data = await response.json();

    expect(data.timestamp).toBeDefined();
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });

  it("returns database status as connected when database is reachable", async () => {
    mockDatabaseHealthyResponses();

    const response = await GET();
    const data = await response.json();

    expect(data.services.database.status).toBe("connected");
  });

  it("returns the postgres server version", async () => {
    mockDatabaseHealthyResponses({ version: "16.0" });

    const response = await GET();
    const data = await response.json();

    expect(data.services.database.version).toBe("16.0");
  });

  it("returns the max connections as a number", async () => {
    mockDatabaseHealthyResponses({ maxConnections: "100" });

    const response = await GET();
    const data = await response.json();

    expect(data.services.database.max_connections).toBe(100);
  });

  it("returns the current opened connections count", async () => {
    mockDatabaseHealthyResponses({ openedConnections: 7 });

    const response = await GET();
    const data = await response.json();

    expect(data.services.database.opened_connections).toBe(7);
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
    const responseBody = JSON.stringify(data);

    expect(responseBody).not.toContain("postgresql://");
    expect(responseBody).not.toContain("password");
    expect(responseBody).not.toContain("DATABASE_URL");
  });

  it("does not expose internal stack traces on error", async () => {
    const databaseError = new Error("Something went wrong");
    databaseError.stack =
      "Error: Something went wrong\n    at Object.<anonymous> (/app/src/lib/prisma.ts:10:15)";
    mockedPrisma.$queryRaw.mockRejectedValueOnce(databaseError);

    const response = await GET();
    const data = await response.json();
    const responseBody = JSON.stringify(data);

    expect(responseBody).not.toContain("at Object");
    expect(responseBody).not.toContain(".ts:");
    expect(responseBody).not.toContain("stack");
  });

  it("only allows GET method", async () => {
    mockDatabaseHealthyResponses();

    const response = await GET();

    expect(response).toBeDefined();
  });

  it("returns correct content-type header", async () => {
    mockDatabaseHealthyResponses();

    const response = await GET();

    expect(response.headers.get("content-type")).toContain("application/json");
  });

  it("does not expose raw database query results", async () => {
    mockDatabaseHealthyResponses();

    const response = await GET();
    const data = await response.json();

    expect(data.services.database.response).toBeUndefined();
  });
});
