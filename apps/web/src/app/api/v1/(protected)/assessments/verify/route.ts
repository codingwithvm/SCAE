import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/middleware";

const VALID_INSTRUMENTS = ["MCEES_1A4", "MCEES_5A9", "MCEES_PROF", "MEES_PROF"];
const ALLOWED_ROLES = ["STUDENT", "TEACHER"] as const;

export const POST = withAuth(
  async (request, decodedTokenPayload) => {
    const requestBody = await request.json();
    const { instrument } = requestBody;

    if (!instrument) {
      return NextResponse.json(
        { error: "instrument is required" },
        { status: 400 },
      );
    }

    if (!VALID_INSTRUMENTS.includes(instrument)) {
      return NextResponse.json(
        { error: "Invalid instrument" },
        { status: 400 },
      );
    }

    const activeRelease = await prisma.assessmentRelease.findFirst({
      where: {
        userId: decodedTokenPayload.userId,
        instrument,
        state: "PENDING",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (!activeRelease) {
      return NextResponse.json({ allowed: false });
    }

    return NextResponse.json({
      allowed: true,
      releaseId: activeRelease.id,
      instrument: activeRelease.instrument,
    });
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);
