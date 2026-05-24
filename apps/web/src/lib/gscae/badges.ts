interface BadgeEvaluationContext {
  scaeLevel: string | null;
  totalScore: number;
  habilidadeCode: string;
  discipline: string;
  isFirstAttempt: boolean;
  isNewBestLevel: boolean;
  totalCompletions: number;
  disciplineCompletions: number;
}

interface BadgeCandidate {
  badgeId: string;
  context: string | null;
}

const SCAE_BADGE_MAP: Record<string, string> = {
  CONHECE: "scae_conhece",
  ENTENDE: "scae_entende",
  APLICA: "scae_aplica",
  RESOLVE: "scae_resolve",
};

const DISCIPLINE_BADGE_MAP: Record<string, string> = {
  MA: "disc_ma",
  LP: "disc_lp",
  CI: "disc_ci",
  IN: "disc_in",
};

const DISCIPLINE_COMPLETIONS_THRESHOLD = 5;

export function evaluateBadgeCandidates(
  ctx: BadgeEvaluationContext,
): BadgeCandidate[] {
  const candidates: BadgeCandidate[] = [];

  if (ctx.isNewBestLevel && ctx.scaeLevel) {
    const badgeId = SCAE_BADGE_MAP[ctx.scaeLevel];
    if (badgeId) {
      candidates.push({
        badgeId,
        context: JSON.stringify({
          habilidadeCode: ctx.habilidadeCode,
          scaeLevel: ctx.scaeLevel,
        }),
      });
    }
  }

  if (ctx.totalCompletions === 1) {
    candidates.push({ badgeId: "primeira_ativ", context: null });
  }
  if (ctx.totalCompletions === 10) {
    candidates.push({ badgeId: "dez_ativ", context: null });
  }
  if (ctx.totalCompletions === 50) {
    candidates.push({ badgeId: "cinquenta_ativ", context: null });
  }

  if (ctx.totalScore >= 1.0) {
    candidates.push({
      badgeId: "nota_perfeita",
      context: JSON.stringify({ habilidadeCode: ctx.habilidadeCode }),
    });
  }

  if (ctx.isFirstAttempt && ctx.totalScore >= 0.8) {
    candidates.push({
      badgeId: "acima_media",
      context: JSON.stringify({ habilidadeCode: ctx.habilidadeCode }),
    });
  }

  if (ctx.disciplineCompletions >= DISCIPLINE_COMPLETIONS_THRESHOLD) {
    const badgeId = DISCIPLINE_BADGE_MAP[ctx.discipline];
    if (badgeId) {
      candidates.push({
        badgeId,
        context: JSON.stringify({ discipline: ctx.discipline }),
      });
    }
  }

  return candidates;
}

export type { BadgeEvaluationContext, BadgeCandidate };
