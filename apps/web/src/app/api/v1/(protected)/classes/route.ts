import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/middleware";

const ALLOWED_ROLES = ["ADMIN", "MUNICIPAL_MANAGER", "SCHOOL_MANAGER"] as const;

export const POST = withAuth(
  async (_request, _decodedTokenPayload) => {
    const classRequestBody = await _request.json();
    const { schoolId, name, grade, year } = classRequestBody;

    if (!schoolId || !name || grade === undefined || grade === null || !year) {
      return NextResponse.json(
        { error: "schoolId, name, grade, and year are required" },
        { status: 400 },
      );
    }

    if (typeof grade !== "number" || grade < 1 || grade > 9) {
      return NextResponse.json(
        { error: "grade must be between 1 and 9" },
        { status: 400 },
      );
    }

    const existingSchool = await prisma.school.findFirst({
      where: { id: schoolId, deletedAt: null },
    });

    if (!existingSchool) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const createdClass = await prisma.class.create({
      data: { schoolId, name, grade, year },
    });

    return NextResponse.json(createdClass, { status: 201 });
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);

export const GET = withAuth(
  async (listRequest) => {
    const requestUrl = new URL(listRequest.url);
    const schoolIdFilter = requestUrl.searchParams.get("schoolId");
    const yearFilter = requestUrl.searchParams.get("year");
    const gradeFilter = requestUrl.searchParams.get("grade");
    const pageParam = parseInt(requestUrl.searchParams.get("page") || "1", 10);
    const perPageParam = parseInt(
      requestUrl.searchParams.get("perPage") || "20",
      10,
    );

    const whereClause: Record<string, unknown> = { deletedAt: null };

    if (schoolIdFilter) {
      whereClause.schoolId = schoolIdFilter;
    }

    if (yearFilter) {
      whereClause.year = parseInt(yearFilter, 10);
    }

    if (gradeFilter) {
      whereClause.grade = parseInt(gradeFilter, 10);
    }

    const [classes, totalClasses] = await Promise.all([
      prisma.class.findMany({
        where: whereClause,
        skip: (pageParam - 1) * perPageParam,
        take: perPageParam,
        orderBy: { name: "asc" },
      }),
      prisma.class.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: classes,
      total: totalClasses,
      page: pageParam,
      perPage: perPageParam,
    });
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);
