import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/middleware";

const VALID_TIERS = ["CONFIRMED", "PREDOMINANT", "IN_MAPPING"];
const ALLOWED_ROLES = ["STUDENT", "TEACHER"] as const;

export const POST = withAuth(
  async (request, decodedTokenPayload, routeContext) => {
    const { id: assessmentId } = await (
      routeContext as { params: Promise<{ id: string }> }
    ).params;

    const existingAssessment = await prisma.assessment.findFirst({
      where: { id: assessmentId },
      include: { result: true },
    });

    if (!existingAssessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 },
      );
    }

    if (existingAssessment.userId !== decodedTokenPayload.userId) {
      return NextResponse.json(
        { error: "Assessment does not belong to this user" },
        { status: 403 },
      );
    }

    if (existingAssessment.result) {
      return NextResponse.json(
        { error: "Assessment already has a result" },
        { status: 409 },
      );
    }

    const requestBody = await request.json();
    const {
      profile,
      axisX,
      axisY,
      confX,
      confY,
      tier,
      scoresJson,
      fullResultJson,
      totalTimeSeconds,
    } = requestBody;

    if (
      !profile ||
      axisX === undefined ||
      axisY === undefined ||
      !tier ||
      !scoresJson ||
      !fullResultJson
    ) {
      return NextResponse.json(
        {
          error:
            "profile, axisX, axisY, tier, scoresJson, and fullResultJson are required",
        },
        { status: 400 },
      );
    }

    if (!VALID_TIERS.includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const createdResult = await prisma.$transaction(async (tx) => {
      await tx.assessment.update({
        where: { id: assessmentId },
        data: {
          state: "COMPLETE",
          completedAt: new Date(),
          totalTimeSeconds: totalTimeSeconds || null,
        },
      });

      if (existingAssessment.releaseId) {
        await tx.assessmentRelease.update({
          where: { id: existingAssessment.releaseId },
          data: { state: "CONSUMED", consumedAt: new Date() },
        });
      }

      return tx.assessmentResult.create({
        data: {
          assessmentId,
          profile,
          axisX,
          axisY,
          confX: confX ?? null,
          confY: confY ?? null,
          tier,
          scoresJson,
          fullResultJson,
        },
      });
    });

    return NextResponse.json(createdResult, { status: 201 });
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);
