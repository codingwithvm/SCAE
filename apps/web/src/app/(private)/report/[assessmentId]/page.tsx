import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
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
import { ReportClient } from "./report-client";

const MANAGER_ROLES = ["SCHOOL_MANAGER", "MUNICIPAL_MANAGER", "ADMIN"];
const TEACHER_INSTRUMENTS = ["MEES_PROF"];

export default async function ReportPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { assessmentId } = await params;

  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId },
    include: {
      result: true,
      user: { select: { name: true, school: { select: { name: true } } } },
    },
  });

  if (!assessment || !assessment.result) redirect("/teacher/dashboard");

  const isOwner = assessment.userId === session.userId;
  const isManager = MANAGER_ROLES.includes(session.role);

  let isTeacherOfStudent = false;
  if (!isOwner && !isManager && session.role === "TEACHER") {
    const sharedClass = await prisma.teacherClass.findFirst({
      where: {
        teacherId: session.userId,
        class: {
          studentEnrollments: { some: { studentId: assessment.userId } },
        },
      },
    });
    isTeacherOfStudent = !!sharedClass;
  }

  if (!isOwner && !isManager && !isTeacherOfStudent)
    redirect("/teacher/dashboard");

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

  const axes = {
    x: Number(result.axisX),
    y: Number(result.axisY),
    confX: result.confX ? Number(result.confX) : null,
    confY: result.confY ? Number(result.confY) : null,
  };

  const data = {
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
    completedAt: assessment.completedAt?.toISOString() || null,
    compatibility,
    axes,
    dimensions: fullResult?.dimensions || null,
    respondentName: assessment.user?.name || null,
    respondentSchool: assessment.user?.school?.name || null,
    respondentClass: null,
  };

  return <ReportClient data={data} />;
}
