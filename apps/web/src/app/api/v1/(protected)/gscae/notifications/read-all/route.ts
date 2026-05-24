import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { prisma } from "@/lib/prisma";

export const PATCH = withAuth(async (_request, decodedTokenPayload) => {
  const result = await prisma.notification.updateMany({
    where: { userId: decodedTokenPayload.userId, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ markedAsRead: result.count });
});
