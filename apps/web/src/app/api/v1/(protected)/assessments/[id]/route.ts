import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/middleware";

const MANAGER_ROLES = ["SCHOOL_MANAGER", "MUNICIPAL_MANAGER", "ADMIN"];

export const GET = withAuth(async (_, decodedTokenPayload, routeContext) => {
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

  const isOwner = existingAssessment.userId === decodedTokenPayload.userId;
  const isManager = MANAGER_ROLES.includes(decodedTokenPayload.role);

  if (!isOwner && !isManager) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  if (isOwner && !isManager && existingAssessment.result) {
    const {
      scoresJson,
      axisX,
      axisY,
      confX,
      confY,
      fullResultJson,
      ...safeResult
    } = existingAssessment.result;

    void scoresJson;
    void axisX;
    void axisY;
    void confX;
    void confY;
    void fullResultJson;

    return NextResponse.json({
      ...existingAssessment,
      result: safeResult,
    });
  }

  return NextResponse.json(existingAssessment);
});
