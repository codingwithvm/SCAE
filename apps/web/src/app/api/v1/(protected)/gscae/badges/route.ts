import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(async (_request, decodedTokenPayload) => {
  if (decodedTokenPayload.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [allBadges, earned] = await Promise.all([
    prisma.badge.findMany({
      orderBy: [{ category: "asc" }, { id: "asc" }],
    }),
    prisma.studentBadge.findMany({
      where: { userId: decodedTokenPayload.userId },
      orderBy: { earnedAt: "desc" },
    }),
  ]);

  const earnedBadgeIds = new Set(earned.map((e) => e.badgeId));

  return NextResponse.json({
    badges: allBadges.map((badge) => ({
      ...badge,
      earned: earnedBadgeIds.has(badge.id),
      earnedAt: earned.find((e) => e.badgeId === badge.id)?.earnedAt ?? null,
    })),
    earned: earned.map((e) => ({
      ...e,
      badge: allBadges.find((b) => b.id === e.badgeId) ?? null,
    })),
    summary: {
      total: allBadges.length,
      earned: earned.length,
      byCategory: {
        scae_level: earned.filter(
          (e) =>
            allBadges.find((b) => b.id === e.badgeId)?.category ===
            "scae_level",
        ).length,
        milestone: earned.filter(
          (e) =>
            allBadges.find((b) => b.id === e.badgeId)?.category === "milestone",
        ).length,
      },
    },
  });
});
