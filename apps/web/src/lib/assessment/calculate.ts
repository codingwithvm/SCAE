import "server-only";

import type {
  Instrument,
  Dimension,
  RankingsMap,
  MEESAnswers,
  ScoreResult,
  Profile,
  Axis,
} from "./types";
import { MEES_PROF } from "./instruments";

function getPMax(instrument: Instrument): number {
  return instrument === "mees_prof" ? 11 : 8;
}

export function calculateScores(
  instrument: Instrument,
  rankings?: RankingsMap,
  meesAnswers?: MEESAnswers,
): ScoreResult {
  const ds: Record<Dimension, number> = { CA: 0, EC: 0, EA: 0, OR: 0 };

  if (instrument === "mees_prof") {
    MEES_PROF.forEach((section) => {
      section.pairs.forEach((pair) => {
        const answer = meesAnswers?.["p" + pair.n];
        if (answer === "A") ds[pair.A.d]++;
        else if (answer === "B") ds[pair.B.d]++;
      });
    });
  } else {
    if (rankings) {
      Object.values(rankings).forEach((blockRanks) => {
        (Object.entries(blockRanks) as [Dimension, number][]).forEach(
          ([dim, rank]) => {
            ds[dim] += rank;
          },
        );
      });
    }
  }

  const X = ds.EA - ds.OR;
  const Y = ds.CA - ds.EC;
  const { confX, confY, conf } = calculateConsistency(X, Y, instrument);

  return { dimensions: ds, X, Y, conf, confX, confY };
}

export function calculateConsistency(
  X: number,
  Y: number,
  instrument: Instrument,
): { confX: number; confY: number; conf: number } {
  const pMax = getPMax(instrument);
  const confX = Math.min(100, Math.round((Math.abs(X) / pMax) * 100));
  const confY = Math.min(100, Math.round((Math.abs(Y) / pMax) * 100));
  const conf = Math.round((confX + confY) / 2);
  return { confX, confY, conf };
}

export function determineProfile(
  X: number,
  Y: number,
  instrument: Instrument,
): Profile {
  if (Math.abs(X) <= 2 && Math.abs(Y) <= 2) return "Equilibrado";

  if (instrument === "mees_prof") {
    if (Y > 0 && X > 0) return "Avaliador";
    if (Y > 0 && X <= 0) return "Especialista";
    if (Y <= 0 && X < 0) return "Mentor";
    return "Facilitador";
  } else {
    if (Y > 0 && X > 0) return "Estrategista";
    if (Y > 0 && X <= 0) return "Analítico";
    if (Y <= 0 && X < 0) return "Criativo";
    return "Prático";
  }
}
export function shouldActivateExtra(confX: number, confY: number): Axis | null {
  const weakX = confX < 40;
  const weakY = confY < 40;

  if (!weakX && !weakY) return null;
  if (weakX && !weakY) return "X";
  if (!weakX && weakY) return "Y";

  return confX <= confY ? "X" : "Y";
}

export function applyExtraAdjustment(
  axis: Axis,
  chosenDimension: Dimension,
): number {
  if (axis === "X") {
    return chosenDimension === "EA" ? 2 : -2;
  } else {
    return chosenDimension === "CA" ? 2 : -2;
  }
}
