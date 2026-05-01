import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { PROFILES } from "@/lib/assessment/profiles";
import {
  LUDIC_EMOJI,
  LUDIC_TAG,
  GSCAE_STUDENT_LUDIC,
} from "@/lib/assessment/report-data";

export async function GET(
  _request: Request,
  routeContext: { params: Promise<{ token: string }> },
) {
  const { token } = await routeContext.params;

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const delivery = await prisma.reportDelivery.findUnique({
    where: { tokenHash },
    include: {
      result: {
        include: {
          assessment: true,
        },
      },
    },
  });

  if (!delivery) {
    return NextResponse.json(
      { error: "Relatório não encontrado" },
      { status: 404 },
    );
  }

  if (new Date() > delivery.tokenExpiresAt) {
    return NextResponse.json(
      { error: "Link expirado" },
      { status: 410 },
    );
  }

  if (!delivery.openedAt) {
    await prisma.reportDelivery.update({
      where: { id: delivery.id },
      data: { openedAt: new Date(), deliveryState: "opened" },
    });
  }

  const { result } = delivery;
  const fullResult =
    typeof result.fullResultJson === "string"
      ? JSON.parse(result.fullResultJson)
      : result.fullResultJson;

  const instrument: string = fullResult?.instrument || "";
  const profile: string = result.profile;

  const instrumentProfiles = PROFILES[instrument];
  const profileData = instrumentProfiles?.[profile] || null;

  const gscae = GSCAE_STUDENT_LUDIC[profile] || null;

  const ludic = {
    emoji: LUDIC_EMOJI[profile] || null,
    tag: LUDIC_TAG[profile] || null,
  };

  return NextResponse.json({
    profile,
    profileData,
    gscae,
    ludic,
  });
}
