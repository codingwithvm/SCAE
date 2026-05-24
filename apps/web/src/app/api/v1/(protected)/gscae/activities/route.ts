import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(async (request, decodedTokenPayload) => {
  if (decodedTokenPayload.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const discipline = url.searchParams.get("discipline");
  const grade = url.searchParams.get("grade");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)),
  );
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { isActive: true };
  if (discipline) where.discipline = discipline;
  if (grade) where.grade = grade;

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      select: {
        id: true,
        habilidadeCode: true,
        habilidadeDesc: true,
        discipline: true,
        grade: true,
        title: true,
        activityVersion: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.activity.count({ where }),
  ]);

  return NextResponse.json({
    activities,
    pagination: { page, limit, total },
  });
});
