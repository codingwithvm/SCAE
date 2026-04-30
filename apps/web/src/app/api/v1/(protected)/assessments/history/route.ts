import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/middleware";

const ALLOWED_ROLES = ["STUDENT", "TEACHER"] as const;

export const GET = withAuth(
  async (request, decodedTokenPayload) => {
    const requestUrl = new URL(request.url);
    const instrumentFilter = requestUrl.searchParams.get("instrument");
    const pageParam = parseInt(requestUrl.searchParams.get("page") || "1", 10);
    const perPageParam = parseInt(
      requestUrl.searchParams.get("perPage") || "20",
      10,
    );

    const whereClause: Record<string, unknown> = {
      userId: decodedTokenPayload.userId,
    };

    if (instrumentFilter) {
      whereClause.instrument = instrumentFilter;
    }

    const [assessments, totalAssessments] = await Promise.all([
      prisma.assessment.findMany({
        where: whereClause,
        include: {
          result: {
            select: { profile: true, tier: true },
          },
        },
        skip: (pageParam - 1) * perPageParam,
        take: perPageParam,
        orderBy: { startedAt: "desc" },
      }),
      prisma.assessment.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: assessments,
      total: totalAssessments,
      page: pageParam,
      perPage: perPageParam,
    });
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);
