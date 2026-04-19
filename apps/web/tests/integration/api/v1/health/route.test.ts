import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/v1/health/route";

describe("GET /api/v1/health", () => {
  it("returns a healthy status with status code 200", async () => {
    const healthCheckResponse = await GET();
    const healthCheckData = await healthCheckResponse.json();

    expect(healthCheckResponse.status).toBe(200);
    expect(healthCheckData.status).toBe("healthy");
  });

  it("returns the current system version", async () => {
    const healthCheckResponse = await GET();
    const healthCheckData = await healthCheckResponse.json();

    expect(healthCheckData.version).toBe("0.1.0");
  });

  it("returns a valid ISO timestamp", async () => {
    const healthCheckResponse = await GET();
    const healthCheckData = await healthCheckResponse.json();

    expect(healthCheckData.timestamp).toBeDefined();
    expect(new Date(healthCheckData.timestamp).toISOString()).toBe(
      healthCheckData.timestamp,
    );
  });
});
