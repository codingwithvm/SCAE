import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { prisma } from "@/lib/prisma";
import { evaluateBadgeCandidates } from "@/lib/gscae/badges";

const SCAE_LEVEL_ORDER: Record<string, number> = {
  CONHECE: 1,
  ENTENDE: 2,
  APLICA: 3,
  RESOLVE: 4,
};

const SCAE_TO_SPAECE: Record<string, string> = {
  CONHECE: "Muito Crítico",
  ENTENDE: "Crítico",
  APLICA: "Intermediário",
  RESOLVE: "Adequado",
};

interface ResponsePayload {
  questionId: string;
  questionText: string;
  level: number;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
  points: number;
  spaeceDescriptor: string;
  responseTimeMs: number;
}

interface CompleteBody {
  scaeLevel: string;
  scores: Record<string, number>;
  reflections: Record<string, string>;
  timeSpentSecs: number;
  responses: ResponsePayload[];
}

export const POST = withAuth(async (request, decodedTokenPayload) => {
  if (decodedTokenPayload.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sessionId = request.url.split("/sessions/")[1].split("/")[0];

  const session = await prisma.activitySession.findUnique({
    where: { id: sessionId },
    include: { activity: true },
  });

  if (!session || session.userId !== decodedTokenPayload.userId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.status !== "started") {
    return NextResponse.json(
      { error: "Session already completed" },
      { status: 409 },
    );
  }

  const body = (await request.json()) as CompleteBody;
  const { scaeLevel, scores, reflections, timeSpentSecs, responses } = body;

  const spaeceLevel = SCAE_TO_SPAECE[scaeLevel] || null;

  const level1Score = scores.CONHECE != null ? scores.CONHECE / 100 : null;
  const level2Score = scores.ENTENDE != null ? scores.ENTENDE / 100 : null;
  const level3Score = scores.APLICA != null ? scores.APLICA / 100 : null;

  const availableScores = [level1Score, level2Score, level3Score].filter(
    (s): s is number => s !== null,
  );
  const totalScore =
    availableScores.length > 0
      ? availableScores.reduce((a, b) => a + b, 0) / availableScores.length
      : 0;

  await prisma.activityResponse.createMany({
    data: responses.map((r) => ({
      sessionId,
      questionId: r.questionId,
      questionText: r.questionText,
      level: r.level,
      selectedOption: r.selectedOption,
      correctOption: r.correctOption,
      isCorrect: r.isCorrect,
      points: r.points,
      spaeceDescriptor: r.spaeceDescriptor,
      responseTimeMs: r.responseTimeMs,
    })),
  });

  const updatedSession = await prisma.activitySession.update({
    where: { id: sessionId },
    data: {
      status: "completed",
      scaeLevel,
      spaeceLevel,
      level1Score,
      level2Score,
      level3Score,
      totalScore,
      timeSpentSecs,
      reflectionData: JSON.stringify(reflections),
      completedAt: new Date(),
    },
  });

  const activity = session.activity;
  const userId = decodedTokenPayload.userId;

  const existingProgress = await prisma.studentProgress.findUnique({
    where: {
      userId_habilidadeCode: {
        userId,
        habilidadeCode: activity.habilidadeCode,
      },
    },
  });

  const prevAttempts = existingProgress?.attemptsCount ?? 0;
  const prevCompletions = existingProgress?.completionsCount ?? 0;
  const newAttempts = prevAttempts + 1;
  const newCompletions = prevCompletions + 1;
  const isFirstAttempt = prevAttempts === 0;

  const prevBestLevel = existingProgress?.bestScaeLevel ?? null;
  const prevBestOrder = prevBestLevel
    ? (SCAE_LEVEL_ORDER[prevBestLevel] ?? 0)
    : 0;
  const currentOrder = SCAE_LEVEL_ORDER[scaeLevel] ?? 0;
  const isNewBestLevel = currentOrder > prevBestOrder;
  const bestScaeLevel = isNewBestLevel
    ? scaeLevel
    : (prevBestLevel ?? scaeLevel);

  const prevAvg = existingProgress?.averageScore ?? 0;
  const averageScore =
    prevCompletions > 0
      ? (prevAvg * prevCompletions + totalScore) / newCompletions
      : totalScore;

  const bestScore = Math.max(existingProgress?.bestScore ?? 0, totalScore);
  const needsAttention = scaeLevel === "CONHECE" || scaeLevel === "ENTENDE";

  const prevEvolution: Array<{
    date: string;
    scaeLevel: string;
    score: number;
  }> = existingProgress?.evolutionData
    ? JSON.parse(existingProgress.evolutionData)
    : [];
  prevEvolution.push({
    date: new Date().toISOString(),
    scaeLevel,
    score: totalScore,
  });

  await prisma.studentProgress.upsert({
    where: {
      userId_habilidadeCode: {
        userId,
        habilidadeCode: activity.habilidadeCode,
      },
    },
    create: {
      userId,
      activityId: activity.id,
      habilidadeCode: activity.habilidadeCode,
      discipline: activity.discipline,
      grade: parseInt(activity.grade, 10),
      attemptsCount: 1,
      completionsCount: 1,
      bestScaeLevel: scaeLevel,
      currentScaeLevel: scaeLevel,
      bestScore,
      averageScore: totalScore,
      needsAttention,
      evolutionData: JSON.stringify(prevEvolution),
    },
    update: {
      attemptsCount: newAttempts,
      completionsCount: newCompletions,
      bestScaeLevel,
      currentScaeLevel: scaeLevel,
      bestScore,
      averageScore,
      needsAttention,
      evolutionData: JSON.stringify(prevEvolution),
      lastAttemptAt: new Date(),
    },
  });

  const disciplineCompletions = await prisma.studentProgress.count({
    where: { userId, discipline: activity.discipline },
  });

  const candidates = evaluateBadgeCandidates({
    scaeLevel,
    totalScore,
    habilidadeCode: activity.habilidadeCode,
    discipline: activity.discipline,
    isFirstAttempt,
    isNewBestLevel,
    totalCompletions: newCompletions,
    disciplineCompletions,
  });

  const newBadges: string[] = [];

  for (const candidate of candidates) {
    const existing = await prisma.studentBadge.findUnique({
      where: {
        userId_badgeId_context: {
          userId,
          badgeId: candidate.badgeId,
          context: candidate.context ?? "",
        },
      },
    });

    if (!existing) {
      try {
        await prisma.studentBadge.create({
          data: {
            userId,
            badgeId: candidate.badgeId,
            context: candidate.context,
          },
        });
        newBadges.push(candidate.badgeId);
      } catch (_) {
        void _;
      }
    }
  }

  return NextResponse.json({ session: updatedSession, newBadges });
});
