import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/middleware";

const ALLOWED_ROLES = ["ADMIN", "MUNICIPAL_MANAGER", "SCHOOL_MANAGER"] as const;

export const DELETE = withAuth(
  async (_request, _decodedTokenPayload, routeContext) => {
    const { id: releaseId } = await (
      routeContext as { params: Promise<{ id: string }> }
    ).params;

    const existingRelease = await prisma.assessmentRelease.findFirst({
      where: { id: releaseId },
    });

    if (!existingRelease) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 });
    }

    if (
      existingRelease.state === "CONSUMED" ||
      existingRelease.state === "EXPIRED"
    ) {
      return NextResponse.json(
        { error: "Release cannot be revoked in its current state" },
        { status: 409 },
      );
    }

    await prisma.assessmentRelease.update({
      where: { id: releaseId },
      data: { state: "EXPIRED" },
    });

    return NextResponse.json({ message: "Release revoked" });
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);
