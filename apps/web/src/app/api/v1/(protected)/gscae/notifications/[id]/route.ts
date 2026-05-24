import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { prisma } from "@/lib/prisma";

export const PATCH = withAuth(
  async (_request, decodedTokenPayload, routeContext) => {
    const { id: notificationId } = await (
      routeContext as { params: Promise<{ id: string }> }
    ).params;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, userId: true, isRead: true },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    if (notification.userId !== decodedTokenPayload.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (notification.isRead) {
      return NextResponse.json({ alreadyRead: true });
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json(updated);
  },
);
