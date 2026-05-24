import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    activitySession: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    activityResponse: {
      createMany: vi.fn(),
    },
    studentProgress: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
    studentBadge: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/lib/gscae/badges", () => ({
  evaluateBadgeCandidates: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { evaluateBadgeCandidates } from "@/lib/gscae/badges";
import { POST } from "@/app/api/v1/(protected)/gscae/sessions/[sessionId]/complete/route";

const mockedSessionFindUnique = vi.mocked(prisma.activitySession.findUnique);
const mockedSessionUpdate = vi.mocked(prisma.activitySession.update);
const mockedResponseCreateMany = vi.mocked(prisma.activityResponse.createMany);
const mockedProgressFindUnique = vi.mocked(prisma.studentProgress.findUnique);
const mockedProgressUpsert = vi.mocked(prisma.studentProgress.upsert);
const mockedProgressCount = vi.mocked(prisma.studentProgress.count);
const mockedBadgeFindUnique = vi.mocked(prisma.studentBadge.findUnique);
const mockedBadgeCreate = vi.mocked(prisma.studentBadge.create);
const mockedVerifyToken = vi.mocked(verifyToken);
const mockedEvaluateBadgeCandidates = vi.mocked(evaluateBadgeCandidates);

const SESSION_ID = "session-001";
const BASE_URL = `http://localhost:3000/api/v1/gscae/sessions/${SESSION_ID}/complete`;

const studentPayload = {
  userId: "550e8400-e29b-41d4-a716-446655440000",
  role: "STUDENT" as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400,
};

const sampleActivity = {
  id: "act-1",
  habilidadeCode: "MA01",
  habilidadeDesc: "Resolver problemas",
  discipline: "Matemática",
  grade: "5",
  title: "Atividade 1",
  isActive: true,
  htmlContent: "<html>test</html>",
  activityVersion: "1.0",
};

const sampleSession = {
  id: SESSION_ID,
  userId: studentPayload.userId,
  activityId: "act-1",
  status: "started",
  activity: sampleActivity,
  createdAt: new Date("2026-05-20T10:00:00Z"),
};

const sampleCompleteBody = {
  scaeLevel: "ENTENDE",
  scores: { CONHECE: 80, ENTENDE: 60, APLICA: 40 },
  reflections: { level1: "Achei fácil", level2: "Tive dúvidas" },
  timeSpentSecs: 300,
  responses: [
    {
      questionId: "q1",
      questionText: "Qual é 2+2?",
      level: 1,
      selectedOption: "A",
      correctOption: "A",
      isCorrect: true,
      points: 10,
      spaeceDescriptor: "D01",
      responseTimeMs: 5000,
    },
    {
      questionId: "q2",
      questionText: "Qual é 3+3?",
      level: 2,
      selectedOption: "B",
      correctOption: "A",
      isCorrect: false,
      points: 0,
      spaeceDescriptor: "D02",
      responseTimeMs: 8000,
    },
  ],
};

function authRequest(
  body: Record<string, unknown> = sampleCompleteBody,
): Request {
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
    body: JSON.stringify(sampleCompleteBody),
  });
}

function setupSuccessfulComplete() {
  mockedSessionFindUnique.mockResolvedValue(sampleSession as never);
  mockedResponseCreateMany.mockResolvedValue({ count: 2 } as never);
  mockedSessionUpdate.mockResolvedValue({
    ...sampleSession,
    status: "completed",
    scaeLevel: "ENTENDE",
  } as never);
  mockedProgressFindUnique.mockResolvedValue(null as never);
  mockedProgressUpsert.mockResolvedValue({} as never);
  mockedProgressCount.mockResolvedValue(1 as never);
  mockedEvaluateBadgeCandidates.mockReturnValue([]);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/v1/gscae/sessions/:sessionId/complete", () => {
  it("should return 401 without authentication", async () => {
    const request = unauthRequest();
    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it("should return 403 for TEACHER role", async () => {
    const teacherPayload = { ...studentPayload, role: "TEACHER" as const };
    mockedVerifyToken.mockReturnValue(teacherPayload);

    const request = authRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return 404 for non-existent session", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedSessionFindUnique.mockResolvedValue(null as never);

    const request = authRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Session not found");
  });

  it("should return 404 for session belonging to another user", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedSessionFindUnique.mockResolvedValue({
      ...sampleSession,
      userId: "other-user-id",
    } as never);

    const request = authRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Session not found");
  });

  it("should return 409 for already completed session", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedSessionFindUnique.mockResolvedValue({
      ...sampleSession,
      status: "completed",
    } as never);

    const request = authRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("Session already completed");
  });

  it("should return 200 with updated session and newBadges", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    setupSuccessfulComplete();
    mockedEvaluateBadgeCandidates.mockReturnValue([
      { badgeId: "primeira_ativ", context: null },
    ]);
    mockedBadgeFindUnique.mockResolvedValue(null as never);
    mockedBadgeCreate.mockResolvedValue({} as never);

    const request = authRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.session).toBeDefined();
    expect(data.newBadges).toContain("primeira_ativ");
  });

  it("should create ActivityResponse records", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    setupSuccessfulComplete();

    const request = authRequest();
    await POST(request);

    expect(mockedResponseCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            sessionId: SESSION_ID,
            questionId: "q1",
            isCorrect: true,
          }),
          expect.objectContaining({
            sessionId: SESSION_ID,
            questionId: "q2",
            isCorrect: false,
          }),
        ]),
      }),
    );
  });

  it("should update session with scores and scaeLevel", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    setupSuccessfulComplete();

    const request = authRequest();
    await POST(request);

    expect(mockedSessionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: SESSION_ID },
        data: expect.objectContaining({
          status: "completed",
          scaeLevel: "ENTENDE",
          spaeceLevel: "Crítico",
          level1Score: 0.8,
          level2Score: 0.6,
          level3Score: 0.4,
          timeSpentSecs: 300,
        }),
      }),
    );
  });

  it("should upsert StudentProgress correctly for first attempt", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    setupSuccessfulComplete();
    mockedProgressFindUnique.mockResolvedValue(null as never);

    const request = authRequest();
    await POST(request);

    expect(mockedProgressUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_habilidadeCode: {
            userId: studentPayload.userId,
            habilidadeCode: "MA01",
          },
        },
        create: expect.objectContaining({
          userId: studentPayload.userId,
          habilidadeCode: "MA01",
          discipline: "Matemática",
          attemptsCount: 1,
          completionsCount: 1,
          bestScaeLevel: "ENTENDE",
          currentScaeLevel: "ENTENDE",
        }),
      }),
    );
  });

  it("should evaluate badges with correct context", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    setupSuccessfulComplete();

    const request = authRequest();
    await POST(request);

    expect(mockedEvaluateBadgeCandidates).toHaveBeenCalledWith(
      expect.objectContaining({
        scaeLevel: "ENTENDE",
        habilidadeCode: "MA01",
        discipline: "Matemática",
        isFirstAttempt: true,
        isNewBestLevel: true,
        totalCompletions: 1,
      }),
    );
  });

  it("should not create badge if already earned", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    setupSuccessfulComplete();
    mockedEvaluateBadgeCandidates.mockReturnValue([
      { badgeId: "primeira_ativ", context: null },
    ]);
    mockedBadgeFindUnique.mockResolvedValue({ id: "existing" } as never);

    const request = authRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(mockedBadgeCreate).not.toHaveBeenCalled();
    expect(data.newBadges).toHaveLength(0);
  });
});
