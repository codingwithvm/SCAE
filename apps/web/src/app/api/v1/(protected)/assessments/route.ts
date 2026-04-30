import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/middleware";

const ALLOWED_ROLES = ["STUDENT", "TEACHER"] as const;

export const POST = withAuth(
  async (request, decodedTokenPayload) => {
    const requestBody = await request.json();
    const { releaseId } = requestBody;

    if (!releaseId) {
      return NextResponse.json(
        { error: "releaseId is required" },
        { status: 400 },
      );
    }

    const pendingRelease = await prisma.assessmentRelease.findFirst({
      where: { id: releaseId, state: "PENDING" },
    });

    if (!pendingRelease) {
      return NextResponse.json(
        { error: "Release not found or not available" },
        { status: 404 },
      );
    }

    if (pendingRelease.userId !== decodedTokenPayload.userId) {
      return NextResponse.json(
        { error: "Release does not belong to this user" },
        { status: 403 },
      );
    }

    const createdAssessment = await prisma.$transaction(async (tx) => {
      await tx.assessmentRelease.update({
        where: { id: releaseId },
        data: { state: "IN_USE" },
      });

      return tx.assessment.create({
        data: {
          userId: decodedTokenPayload.userId,
          instrument: pendingRelease.instrument,
          releaseId,
        },
      });
    });

    return NextResponse.json(createdAssessment, { status: 201 });
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);
