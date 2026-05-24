import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(async (request, decodedTokenPayload) => {
  if (decodedTokenPayload.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sessionId = request.url.split("/sessions/")[1].split("/")[0];

  const session = await prisma.activitySession.findUnique({
    where: { id: sessionId },
    include: {
      activity: {
        select: {
          habilidadeCode: true,
          habilidadeDesc: true,
          discipline: true,
          grade: true,
          title: true,
          activityVersion: true,
        },
      },
      responses: {
        orderBy: [{ level: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!session || session.userId !== decodedTokenPayload.userId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.status !== "completed") {
    return NextResponse.json(
      { error: "Session not completed" },
      { status: 422 },
    );
  }

  const scores: Record<string, number | null> = {
    CONHECE:
      session.level1Score != null
        ? Math.round(session.level1Score * 100)
        : null,
    ENTENDE:
      session.level2Score != null
        ? Math.round(session.level2Score * 100)
        : null,
    APLICA:
      session.level3Score != null
        ? Math.round(session.level3Score * 100)
        : null,
  };

  const totalQuestions = session.responses.length;
  const correctAnswers = session.responses.filter((r) => r.isCorrect).length;

  const byLevelMap = new Map<number, { total: number; correct: number }>();
  for (const r of session.responses) {
    const entry = byLevelMap.get(r.level) || { total: 0, correct: 0 };
    entry.total++;
    if (r.isCorrect) entry.correct++;
    byLevelMap.set(r.level, entry);
  }
  const byLevel = Array.from(byLevelMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([level, data]) => ({ level, ...data }));

  const responsesByLevel: Record<string, typeof session.responses> = {};
  for (const r of session.responses) {
    const key = String(r.level);
    if (!responsesByLevel[key]) responsesByLevel[key] = [];
    responsesByLevel[key].push(r);
  }

  const reflections = session.reflectionData
    ? JSON.parse(session.reflectionData)
    : {};

  return NextResponse.json({
    session: {
      id: session.id,
      status: session.status,
      scaeLevel: session.scaeLevel,
      spaeceLevel: session.spaeceLevel,
      totalScore: session.totalScore,
      timeSpentSecs: session.timeSpentSecs,
      completedAt: session.completedAt,
    },
    activity: session.activity,
    scores,
    stats: { totalQuestions, correctAnswers, byLevel },
    responsesByLevel,
    reflections,
  });
});
