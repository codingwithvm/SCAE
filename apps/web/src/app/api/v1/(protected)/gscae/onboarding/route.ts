import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(async (_request, decodedTokenPayload) => {
  const user = await prisma.user.findUnique({
    where: { id: decodedTokenPayload.userId },
    select: {
      onboardingCompleted: true,
      onboardingCompletedAt: true,
      scaeProfile: true,
      mceUnlocked: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    onboardingCompleted: user.onboardingCompleted,
    onboardingCompletedAt: user.onboardingCompletedAt,
    scaeProfile: user.scaeProfile,
    mceUnlocked: user.mceUnlocked,
    pendingSteps: buildPendingSteps(user),
  });
});

export const PATCH = withAuth(async (request, decodedTokenPayload) => {
  let body: { onboardingCompleted?: boolean };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (typeof body.onboardingCompleted !== "boolean") {
    return NextResponse.json(
      { error: "onboardingCompleted (boolean) is required" },
      { status: 400 },
    );
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: decodedTokenPayload.userId },
    select: { onboardingCompleted: true, scaeProfile: true },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (body.onboardingCompleted && !currentUser.scaeProfile) {
    return NextResponse.json(
      { error: "Cannot complete onboarding without a scaeProfile" },
      { status: 422 },
    );
  }

  if (body.onboardingCompleted && currentUser.onboardingCompleted) {
    return NextResponse.json(
      { error: "Onboarding already completed" },
      { status: 409 },
    );
  }

  const updated = await prisma.user.update({
    where: { id: decodedTokenPayload.userId },
    data: {
      onboardingCompleted: body.onboardingCompleted,
      onboardingCompletedAt: body.onboardingCompleted ? new Date() : null,
    },
    select: {
      onboardingCompleted: true,
      onboardingCompletedAt: true,
      scaeProfile: true,
      mceUnlocked: true,
    },
  });

  return NextResponse.json({
    onboardingCompleted: updated.onboardingCompleted,
    onboardingCompletedAt: updated.onboardingCompletedAt,
    scaeProfile: updated.scaeProfile,
    mceUnlocked: updated.mceUnlocked,
    pendingSteps: buildPendingSteps(updated),
  });
});

function buildPendingSteps(user: {
  scaeProfile: string | null;
  onboardingCompleted: boolean;
  mceUnlocked: boolean;
}) {
  const steps: string[] = [];

  if (!user.scaeProfile) {
    steps.push("select_profile");
  }

  if (!user.onboardingCompleted) {
    steps.push("complete_onboarding");
  }

  return steps;
}
