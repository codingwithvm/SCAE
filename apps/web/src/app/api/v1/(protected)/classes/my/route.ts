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

  const classes = await prisma.class.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, grade: true, year: true },
    orderBy: [{ year: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ classes });
});
