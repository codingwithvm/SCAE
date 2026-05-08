import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/middleware";

const VALID_INSTRUMENTS = ["MCEES_1A4", "MCEES_5A9", "MCEES_PROF", "MEES_PROF"];
const ALLOWED_ROLES = ["STUDENT", "TEACHER"] as const;

export const POST = withAuth(
  async (request, decodedTokenPayload) => {
    const requestBody = await request.json();
    const { instrument } = requestBody;

    if (instrument && !VALID_INSTRUMENTS.includes(instrument)) {
      return NextResponse.json(
        { error: "Invalid instrument" },
        { status: 400 },
      );
    }

    const whereClause: Record<string, unknown> = {
      userId: decodedTokenPayload.userId,
      state: "PENDING",
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    };

    if (instrument) {
      whereClause.instrument = instrument;
    }

    const activeReleases = await prisma.assessmentRelease.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
    });

    const completedInstruments = await prisma.assessment.findMany({
      where: {
        userId: decodedTokenPayload.userId,
        completedAt: { not: null },
      },
      select: { instrument: true },
    });

    const completedSet = new Set(completedInstruments.map((a) => a.instrument));
    const filtered = activeReleases.filter(
      (r) => !completedSet.has(r.instrument),
    );

    if (filtered.length === 0) {
      return NextResponse.json({ allowed: false, releases: [] });
    }

    return NextResponse.json({
      allowed: true,
      releases: filtered.map((r) => ({
        releaseId: r.id,
        instrument: r.instrument,
      })),
      releaseId: filtered[0].id,
      instrument: filtered[0].instrument,
    });
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);
