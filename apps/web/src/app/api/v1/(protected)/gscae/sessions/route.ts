import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { prisma } from "@/lib/prisma";

export const POST = withAuth(async (request, decodedTokenPayload) => {
  if (decodedTokenPayload.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { activityId } = body as { activityId: string };

  if (!activityId) {
    return NextResponse.json(
      { error: "activityId is required" },
      { status: 400 },
    );
  }

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { id: true, isActive: true, htmlContent: true },
  });

  if (!activity) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }

  if (!activity.isActive) {
    return NextResponse.json(
      { error: "Activity is not active" },
      { status: 422 },
    );
  }

  const session = await prisma.activitySession.create({
    data: {
      userId: decodedTokenPayload.userId,
      activityId: activity.id,
      status: "started",
    },
    select: {
      id: true,
      activityId: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    { session, htmlContent: activity.htmlContent },
    { status: 201 },
  );
});
