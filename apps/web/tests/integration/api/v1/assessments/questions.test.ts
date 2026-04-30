import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { verifyToken } from "@/lib/auth/jwt";
import { GET } from "@/app/api/v1/(protected)/assessments/questions/route";

const mockedVerifyToken = vi.mocked(verifyToken);

function createRequest(instrument?: string): Request {
  const url = instrument
    ? `http://localhost:3000/api/v1/assessments/questions?instrument=${instrument}`
    : "http://localhost:3000/api/v1/assessments/questions";

  return new Request(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid-token",
    },
  });
}

describe("GET /api/v1/assessments/questions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedVerifyToken.mockReturnValue({
      userId: "user-1",
      role: "STUDENT",
      iat: 0,
      exp: 0,
    } as never);
  });

  it("returns 400 when instrument is missing", async () => {
    const response = await GET(createRequest());
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Invalid or missing instrument");
  });

  it("returns 400 for invalid instrument", async () => {
    const response = await GET(createRequest("invalid"));
    expect(response.status).toBe(400);
  });

  it("returns blocks and extras for mcees_1a4", async () => {
    const response = await GET(createRequest("mcees_1a4"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.blocks).toBeDefined();
    expect(body.blocks).toHaveLength(4);
    expect(body.extraX).toBeDefined();
    expect(body.extraY).toBeDefined();
    expect(body.sections).toBeUndefined();
  });

  it("returns blocks and extras for mcees_5a9", async () => {
    const response = await GET(createRequest("mcees_5a9"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.blocks).toHaveLength(4);
  });

  it("returns blocks and extras for mcees_prof", async () => {
    const response = await GET(createRequest("mcees_prof"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.blocks).toHaveLength(4);
  });

  it("returns sections and extras for mees_prof", async () => {
    const response = await GET(createRequest("mees_prof"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.sections).toBeDefined();
    expect(body.sections).toHaveLength(4);
    expect(body.blocks).toBeUndefined();
    expect(body.extraX).toBeDefined();
    expect(body.extraY).toBeDefined();
  });

  it("returns 401 for unauthenticated requests", async () => {
    mockedVerifyToken.mockImplementation(() => {
      throw new Error("Invalid token");
    });
    const response = await GET(createRequest("mcees_1a4"));
    expect(response.status).toBe(401);
  });
});
