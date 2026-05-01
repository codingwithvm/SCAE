import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/middleware";
import { TIER_LABELS, TIER_COLORS } from "@/lib/assessment/report-data";
import { PROFILES } from "@/lib/assessment/profiles";

const PRIVILEGED_ROLES = ["SCHOOL_MANAGER", "MUNICIPAL_MANAGER", "ADMIN"];

export const GET = withAuth(async (_, decodedTokenPayload, routeContext) => {
  const { id: classId } = await (
    routeContext as { params: Promise<{ id: string }> }
  ).params;

  const isPrivileged = PRIVILEGED_ROLES.includes(decodedTokenPayload.role);
  const isTeacher = decodedTokenPayload.role === "TEACHER";

  if (!isPrivileged && !isTeacher) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  if (isTeacher) {
    const link = await prisma.teacherClass.findUnique({
      where: {
        teacherId_classId: {
          teacherId: decodedTokenPayload.userId,
          classId,
        },
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
  }

  const enrollments = await prisma.studentClass.findMany({
    where: { classId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          registrationNumber: true,
          assessments: {
            where: { state: "COMPLETE" },
            include: { result: true },
            orderBy: { completedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const students = enrollments.map((enrollment) => {
    const student = enrollment.student;
    const assessment = student.assessments[0] || null;
    const result = assessment?.result || null;

    let profileColor: string | null = null;
    if (result) {
      const instrumentProfiles = PROFILES[assessment.instrument];
      const profileData = instrumentProfiles?.[result.profile];
      profileColor = profileData?.cor || null;
    }

    return {
      studentId: student.id,
      studentName: student.name,
      studentRegistration: student.registrationNumber,
      assessmentId: assessment?.id || null,
      instrument: assessment?.instrument || null,
      profile: result?.profile || null,
      tier: result?.tier || null,
      tierLabel: result ? TIER_LABELS[result.tier] || result.tier : null,
      tierColor: result ? TIER_COLORS[result.tier] || "#6B7280" : null,
      profileColor,
      completedAt: assessment?.completedAt || null,
    };
  });

  students.sort((a, b) => a.studentName.localeCompare(b.studentName, "pt-BR"));

  return NextResponse.json({ classId, students });
});
