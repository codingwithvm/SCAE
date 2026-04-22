import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/middleware";

const ALLOWED_ROLES = ["ADMIN", "MUNICIPAL_MANAGER", "SCHOOL_MANAGER"] as const;

interface ClassRouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withAuth(
  async (_request, _decodedTokenPayload, routeContext) => {
    const { id: classId } = await (routeContext as unknown as ClassRouteContext)
      .params;

    const foundClass = await prisma.class.findFirst({
      where: { id: classId, deletedAt: null },
    });

    if (!foundClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json(foundClass);
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);

export const PUT = withAuth(
  async (updateRequest, _decodedTokenPayload, routeContext) => {
    const { id: classId } = await (routeContext as unknown as ClassRouteContext)
      .params;

    const existingClass = await prisma.class.findFirst({
      where: { id: classId, deletedAt: null },
    });

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const updateRequestBody = await updateRequest.json();
    const { name, grade, year, schoolId } = updateRequestBody;

    if (!name && grade === undefined && !year && !schoolId) {
      return NextResponse.json(
        {
          error:
            "At least one field (name, grade, year, or schoolId) is required",
        },
        { status: 400 },
      );
    }

    if (
      grade !== undefined &&
      (typeof grade !== "number" || grade < 1 || grade > 9)
    ) {
      return NextResponse.json(
        { error: "grade must be between 1 and 9" },
        { status: 400 },
      );
    }

    if (schoolId) {
      const existingSchool = await prisma.school.findFirst({
        where: { id: schoolId, deletedAt: null },
      });

      if (!existingSchool) {
        return NextResponse.json(
          { error: "School not found" },
          { status: 404 },
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (grade !== undefined) updateData.grade = grade;
    if (year) updateData.year = year;
    if (schoolId) updateData.schoolId = schoolId;

    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: updateData,
    });

    return NextResponse.json(updatedClass);
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);

export const DELETE = withAuth(
  async (_request, _decodedTokenPayload, routeContext) => {
    const { id: classId } = await (routeContext as unknown as ClassRouteContext)
      .params;

    const existingClass = await prisma.class.findFirst({
      where: { id: classId, deletedAt: null },
    });

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    await prisma.class.update({
      where: { id: classId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Class deleted" });
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);
