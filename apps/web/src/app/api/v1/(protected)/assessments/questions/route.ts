import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import {
  MCEES_1A4,
  MCEES_5A9,
  MCEES_PROF,
  MEES_PROF,
  EXTRA_X,
  EXTRA_Y,
  EXTRA_X_1A4,
  EXTRA_Y_1A4,
} from "@/lib/assessment/instruments";
import type { Instrument } from "@/lib/assessment/types";

const ALLOWED_ROLES = ["STUDENT", "TEACHER"] as const;

const INSTRUMENT_DATA: Record<
  Instrument,
  {
    blocks?: unknown[];
    sections?: unknown[];
    extraX: unknown[];
    extraY: unknown[];
  }
> = {
  mcees_1a4: { blocks: MCEES_1A4, extraX: EXTRA_X_1A4, extraY: EXTRA_Y_1A4 },
  mcees_5a9: { blocks: MCEES_5A9, extraX: EXTRA_X, extraY: EXTRA_Y },
  mcees_prof: { blocks: MCEES_PROF, extraX: EXTRA_X, extraY: EXTRA_Y },
  mees_prof: { sections: MEES_PROF, extraX: EXTRA_X, extraY: EXTRA_Y },
};

const VALID_INSTRUMENTS = new Set<string>(Object.keys(INSTRUMENT_DATA));

export const GET = withAuth(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const instrument = searchParams.get("instrument");

    if (!instrument || !VALID_INSTRUMENTS.has(instrument)) {
      return NextResponse.json(
        { error: "Invalid or missing instrument parameter" },
        { status: 400 },
      );
    }

    return NextResponse.json(INSTRUMENT_DATA[instrument as Instrument]);
  },
  { allowedRoles: [...ALLOWED_ROLES] },
);
