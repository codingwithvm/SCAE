import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/middleware";
import { PROFILES } from "@/lib/assessment/profiles";
import {
  LUDIC_EMOJI,
  LUDIC_TAG,
  GSCAE_STUDENT_LUDIC,
  GSCAE_STUDENT_FULL,
  GSCAE_TEACHER,
  TEACHER_STUDENT_COMPATIBILITY,
  TIER_COLORS,
  TIER_LABELS,
  AXIS_LABELS,
} from "@/lib/assessment/report-data";

const MANAGER_ROLES = ["SCHOOL_MANAGER", "MUNICIPAL_MANAGER", "ADMIN"];
const TEACHER_INSTRUMENTS = ["MEES_PROF", "MCEES_PROF"];

export const GET = withAuth(async (_, decodedTokenPayload, routeContext) => {
  const { id: assessmentId } = await (
    routeContext as { params: Promise<{ id: string }> }
  ).params;

  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId },
    include: { result: true },
  });

  if (!assessment) {
    return NextResponse.json(
      { error: "Assessment not found" },
      { status: 404 },
    );
  }

  const isOwner = assessment.userId === decodedTokenPayload.userId;
  const isManager = MANAGER_ROLES.includes(decodedTokenPayload.role);

  let isTeacherOfStudent = false;
  if (!isOwner && !isManager && decodedTokenPayload.role === "TEACHER") {
    const sharedClass = await prisma.teacherClass.findFirst({
      where: {
        teacherId: decodedTokenPayload.userId,
        class: {
          studentEnrollments: {
            some: { studentId: assessment.userId },
          },
        },
      },
    });
    isTeacherOfStudent = !!sharedClass;
  }

  if (!isOwner && !isManager && !isTeacherOfStudent) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  if (!assessment.result) {
    return NextResponse.json(
      { error: "Assessment has no result yet" },
      { status: 400 },
    );
  }

  const { result } = assessment;
  const fullResult =
    typeof result.fullResultJson === "string"
      ? JSON.parse(result.fullResultJson)
      : result.fullResultJson;

  const instrument: string = fullResult?.instrument || "";
  const profile: string = result.profile;
  const tier: string = result.tier;

  const instrumentProfiles = PROFILES[instrument];
  const profileData = instrumentProfiles?.[profile] || null;

  const isTeacherInstrument = TEACHER_INSTRUMENTS.includes(
    assessment.instrument,
  );

  const gscaeMap =
    assessment.instrument === "MEES_PROF"
      ? GSCAE_TEACHER
      : assessment.instrument === "MCEES_PROF"
        ? GSCAE_STUDENT_FULL
        : GSCAE_STUDENT_LUDIC;
  const gscae = gscaeMap[profile] || null;

  const ludic = {
    emoji: LUDIC_EMOJI[profile] || null,
    tag: LUDIC_TAG[profile] || null,
  };

  const tierInfo = {
    key: tier,
    label: TIER_LABELS[tier] || tier,
    color: TIER_COLORS[tier] || "#6B7280",
  };

  const compatibility = isTeacherInstrument
    ? TEACHER_STUDENT_COMPATIBILITY[profile] || null
    : null;

  const axisLabels = isTeacherInstrument
    ? AXIS_LABELS.teacher
    : AXIS_LABELS.student;

  const response: Record<string, unknown> = {
    assessmentId: assessment.id,
    instrument: assessment.instrument,
    profile,
    tier: tierInfo.key,
    tierInfo,
    profileData,
    gscae,
    ludic,
    axisLabels,
    isTeacherInstrument,
    completedAt: assessment.completedAt,
  };

  if (compatibility) {
    response.compatibility = compatibility;
  }

  if (
    isManager ||
    decodedTokenPayload.role === "TEACHER" ||
    isTeacherOfStudent
  ) {
    response.axes = {
      x: Number(result.axisX),
      y: Number(result.axisY),
      confX: result.confX ? Number(result.confX) : null,
      confY: result.confY ? Number(result.confY) : null,
    };
    response.dimensions = fullResult?.dimensions || null;
  }

  return NextResponse.json(response);
});
