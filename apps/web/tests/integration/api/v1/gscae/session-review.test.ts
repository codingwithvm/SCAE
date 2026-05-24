import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    activitySession: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { GET } from "@/app/api/v1/(protected)/gscae/sessions/[sessionId]/review/route";

const mockedSessionFindUnique = vi.mocked(prisma.activitySession.findUnique);
const mockedVerifyToken = vi.mocked(verifyToken);

const SESSION_ID = "session-001";
const BASE_URL = `http://localhost:3000/api/v1/gscae/sessions/${SESSION_ID}/review`;

const studentPayload = {
  userId: "550e8400-e29b-41d4-a716-446655440000",
  role: "STUDENT" as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 86400,
};

const sampleResponses = [
  {
    id: "resp-1",
    sessionId: SESSION_ID,
    questionId: "q1",
    questionText: "Qual é 2+2?",
    level: 1,
    selectedOption: "A",
    correctOption: "A",
    isCorrect: true,
    points: 10,
    spaeceDescriptor: "D01",
    responseTimeMs: 5000,
    createdAt: new Date("2026-05-20T10:01:00Z"),
  },
  {
    id: "resp-2",
    sessionId: SESSION_ID,
    questionId: "q2",
    questionText: "Qual é 3x3?",
    level: 1,
    selectedOption: "B",
    correctOption: "B",
    isCorrect: true,
    points: 10,
    spaeceDescriptor: "D02",
    responseTimeMs: 4000,
    createdAt: new Date("2026-05-20T10:02:00Z"),
  },
  {
    id: "resp-3",
    sessionId: SESSION_ID,
    questionId: "q3",
    questionText: "Resolva x+1=3",
    level: 2,
    selectedOption: "C",
    correctOption: "A",
    isCorrect: false,
    points: 0,
    spaeceDescriptor: "D03",
    responseTimeMs: 12000,
    createdAt: new Date("2026-05-20T10:03:00Z"),
  },
];

const sampleCompletedSession = {
  id: SESSION_ID,
  userId: studentPayload.userId,
  activityId: "act-1",
  status: "completed",
  scaeLevel: "ENTENDE",
  spaeceLevel: "Crítico",
  totalScore: 0.6,
  level1Score: 0.8,
  level2Score: 0.4,
  level3Score: null,
  timeSpentSecs: 300,
  reflectionData: JSON.stringify({
    level1: "Foi tranquilo",
    level2: "Difícil",
  }),
  completedAt: new Date("2026-05-20T10:05:00Z"),
  createdAt: new Date("2026-05-20T10:00:00Z"),
  activity: {
    habilidadeCode: "MA01",
    habilidadeDesc: "Resolver problemas",
    discipline: "Matemática",
    grade: "5",
    title: "Atividade 1",
    activityVersion: "1.0",
  },
  responses: sampleResponses,
};

function authRequest(): Request {
  return new Request(BASE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid-token",
    },
  });
}

function unauthRequest(): Request {
  return new Request(BASE_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/v1/gscae/sessions/:sessionId/review", () => {
  it("should return 401 without authentication", async () => {
    const request = unauthRequest();
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("should return 403 for TEACHER role", async () => {
    const teacherPayload = { ...studentPayload, role: "TEACHER" as const };
    mockedVerifyToken.mockReturnValue(teacherPayload);

    const request = authRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return 404 for non-existent session", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedSessionFindUnique.mockResolvedValue(null as never);

    const request = authRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Session not found");
  });

  it("should return 404 for session belonging to another user", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedSessionFindUnique.mockResolvedValue({
      ...sampleCompletedSession,
      userId: "other-user-id",
    } as never);

    const request = authRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Session not found");
  });

  it("should return 422 for non-completed session", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedSessionFindUnique.mockResolvedValue({
      ...sampleCompletedSession,
      status: "started",
    } as never);

    const request = authRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBe("Session not completed");
  });

  it("should return correct review data structure", async () => {
    mockedVerifyToken.mockReturnValue(studentPayload);
    mockedSessionFindUnique.mockResolvedValue(sampleCompletedSession as never);

    const request = authRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);

    expect(data.session).toEqual(
      expect.objectContaining({
        id: SESSION_ID,
        status: "completed",
        scaeLevel: "ENTENDE",
        spaeceLevel: "Crítico",
      }),
    );

    expect(data.activity).toEqual(
      expect.objectContaining({
        habilidadeCode: "MA01",
        title: "Atividade 1",
      }),
    );

    expect(data.scores).toEqual({
      CONHECE: 80,
      ENTENDE: 40,
      APLICA: null,
    });

    expect(data.stats.totalQuestions).toBe(3);
    expect(data.stats.correctAnswers).toBe(2);
    expect(data.stats.byLevel).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ level: 1, total: 2, correct: 2 }),
        expect.objectContaining({ level: 2, total: 1, correct: 0 }),
      ]),
    );

    expect(data.responsesByLevel["1"]).toHaveLength(2);
    expect(data.responsesByLevel["2"]).toHaveLength(1);

    expect(data.reflections).toEqual({
      level1: "Foi tranquilo",
      level2: "Difícil",
    });
  });
});
