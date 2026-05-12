import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    reportDelivery: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/assessment/profiles", () => ({
  PROFILES: {
    "instrument-1": {
      Criativo: {
        cor: "#C05621",
        descricao: "Perfil criativo",
      },
    },
  },
}));

vi.mock("@/lib/assessment/report-data", () => ({
  LUDIC_EMOJI: { Criativo: "🎨" },
  LUDIC_TAG: { Criativo: "Artista" },
  GSCAE_STUDENT_LUDIC: {
    Criativo: [{ stage: "creative", level: "gs-strong" }],
  },
}));

import { prisma } from "@/lib/prisma";
import { GET } from "@/app/api/v1/report/public/[token]/route";
import { createHash } from "crypto";

const mockedReportDeliveryFindUnique = vi.mocked(
  prisma.reportDelivery.findUnique,
);
const mockedReportDeliveryUpdate = vi.mocked(prisma.reportDelivery.update);

function createRequest(token: string): Request {
  return new Request(`http://localhost/api/v1/report/public/${token}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

const validToken = "valid-report-token-abc123";
const tokenHash = createHash("sha256").update(validToken).digest("hex");

const futureDate = new Date(Date.now() + 86400000);
const pastDate = new Date(Date.now() - 86400000);

const validDelivery = {
  id: "del00000-0000-0000-0000-000000000001",
  tokenHash,
  tokenExpiresAt: futureDate,
  openedAt: null,
  deliveryState: "sent",
  result: {
    profile: "Criativo",
    fullResultJson: JSON.stringify({ instrument: "instrument-1" }),
    assessment: { id: "ass00000-0000-0000-0000-000000000001" },
  },
};

const alreadyOpenedDelivery = {
  ...validDelivery,
  openedAt: new Date("2026-03-01T10:00:00Z"),
  deliveryState: "opened",
};

const routeContext = { params: Promise.resolve({ token: validToken }) };

describe("GET /api/v1/report/public/:token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna dados do relatório com token válido", async () => {
    mockedReportDeliveryFindUnique.mockResolvedValueOnce(
      validDelivery as never,
    );
    mockedReportDeliveryUpdate.mockResolvedValueOnce({} as never);

    const request = createRequest(validToken);
    const response = await GET(request, routeContext);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.profile).toBe("Criativo");
    expect(data.profileData).toBeDefined();
    expect(data.gscae).toBeDefined();
    expect(data.ludic.emoji).toBe("🎨");
    expect(data.ludic.tag).toBe("Artista");
  });

  it("marca openedAt na primeira visualização", async () => {
    mockedReportDeliveryFindUnique.mockResolvedValueOnce(
      validDelivery as never,
    );
    mockedReportDeliveryUpdate.mockResolvedValueOnce({} as never);

    const request = createRequest(validToken);
    await GET(request, routeContext);

    expect(mockedReportDeliveryUpdate).toHaveBeenCalledWith({
      where: { id: validDelivery.id },
      data: { openedAt: expect.any(Date), deliveryState: "opened" },
    });
  });

  it("não atualiza openedAt em visualizações subsequentes", async () => {
    mockedReportDeliveryFindUnique.mockResolvedValueOnce(
      alreadyOpenedDelivery as never,
    );

    const request = createRequest(validToken);
    await GET(request, routeContext);

    expect(mockedReportDeliveryUpdate).not.toHaveBeenCalled();
  });

  it("retorna 404 para token inexistente", async () => {
    mockedReportDeliveryFindUnique.mockResolvedValueOnce(null);

    const fakeToken = "nonexistent-token";
    const fakeRouteContext = {
      params: Promise.resolve({ token: fakeToken }),
    };

    const request = createRequest(fakeToken);
    const response = await GET(request, fakeRouteContext);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Relatório não encontrado");
  });

  it("retorna 410 para token expirado", async () => {
    const expiredDelivery = {
      ...validDelivery,
      tokenExpiresAt: pastDate,
    };
    mockedReportDeliveryFindUnique.mockResolvedValueOnce(
      expiredDelivery as never,
    );

    const request = createRequest(validToken);
    const response = await GET(request, routeContext);
    const data = await response.json();

    expect(response.status).toBe(410);
    expect(data.error).toBe("Link expirado");
  });

  it("busca pelo hash do token e não pelo token em texto puro", async () => {
    mockedReportDeliveryFindUnique.mockResolvedValueOnce(null);

    const request = createRequest(validToken);
    const fakeRouteContext = {
      params: Promise.resolve({ token: validToken }),
    };

    await GET(request, fakeRouteContext);

    expect(mockedReportDeliveryFindUnique).toHaveBeenCalledWith({
      where: { tokenHash },
      include: {
        result: {
          include: {
            assessment: true,
          },
        },
      },
    });
  });

  it("não requer autenticação (rota pública)", async () => {
    mockedReportDeliveryFindUnique.mockResolvedValueOnce(
      validDelivery as never,
    );
    mockedReportDeliveryUpdate.mockResolvedValueOnce({} as never);

    const request = new Request(
      `http://localhost/api/v1/report/public/${validToken}`,
      { method: "GET" },
    );
    const response = await GET(request, routeContext);

    expect(response.status).toBe(200);
  });

  it("não expõe dados sensíveis na resposta (sem passwordHash, tokenHash, assessment completo)", async () => {
    mockedReportDeliveryFindUnique.mockResolvedValueOnce(
      validDelivery as never,
    );
    mockedReportDeliveryUpdate.mockResolvedValueOnce({} as never);

    const request = createRequest(validToken);
    const response = await GET(request, routeContext);
    const data = await response.json();
    const raw = JSON.stringify(data);

    expect(raw).not.toContain("passwordHash");
    expect(raw).not.toContain("tokenHash");
    expect(raw).not.toContain("tokenExpiresAt");
    expect(raw).not.toContain("deliveryState");
    expect(data.profile).toBeDefined();
    expect(data.profileData).toBeDefined();
    expect(data.gscae).toBeDefined();
    expect(data.ludic).toBeDefined();
  });

  it("token manipulado não retorna dados de outro relatório", async () => {
    const tamperedToken = "tampered-token-xyz";
    const tamperedHash = createHash("sha256")
      .update(tamperedToken)
      .digest("hex");

    mockedReportDeliveryFindUnique.mockResolvedValueOnce(null);

    const tamperedRouteContext = {
      params: Promise.resolve({ token: tamperedToken }),
    };

    const request = createRequest(tamperedToken);
    const response = await GET(request, tamperedRouteContext);

    expect(response.status).toBe(404);
    expect(mockedReportDeliveryFindUnique).toHaveBeenCalledWith({
      where: { tokenHash: tamperedHash },
      include: expect.any(Object),
    });
  });
});
