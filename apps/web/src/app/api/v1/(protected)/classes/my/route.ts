import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/middleware";

const PRIVILEGED_ROLES = ["SCHOOL_MANAGER", "MUNICIPAL_MANAGER", "ADMIN"];

export const GET = withAuth(async (_, decodedTokenPayload) => {
  const isPrivileged = PRIVILEGED_ROLES.includes(decodedTokenPayload.role);
  const isTeacher = decodedTokenPayload.role === "TEACHER";

  if (!isPrivileged && !isTeacher) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  if (isTeacher) {
    const links = await prisma.teacherClass.findMany({
      where: { teacherId: decodedTokenPayload.userId },
      include: {
        class: {
          select: { id: true, name: true, grade: true, year: true },
        },
      },
    });

    const classes = links.map((l) => l.class);
    return NextResponse.json({ classes });
  }

  const schoolScoped = decodedTokenPayload.role === "SCHOOL_MANAGER";
  const municipalScoped = decodedTokenPayload.role === "MUNICIPAL_MANAGER";

  let schoolFilter: Record<string, unknown> = {};

  if (schoolScoped) {
    const manager = await prisma.user.findUnique({
      where: { id: decodedTokenPayload.userId },
      select: { schoolId: true },
    });
    if (manager?.schoolId) {
      schoolFilter = { schoolId: manager.schoolId };
    }
  } else if (municipalScoped) {
    const manager = await prisma.user.findUnique({
      where: { id: decodedTokenPayload.userId },
      select: { municipalityId: true },
    });
    if (manager?.municipalityId) {
      schoolFilter = { school: { municipalityId: manager.municipalityId } };
    }
  }

  const classes = await prisma.class.findMany({
    where: { deletedAt: null, ...schoolFilter },
    select: { id: true, name: true, grade: true, year: true, schoolId: true },
    orderBy: [{ year: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ classes });
});
