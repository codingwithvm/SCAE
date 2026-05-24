import { describe, expect, it } from "vitest";
import { evaluateBadgeCandidates } from "@/lib/gscae/badges";
import type { BadgeEvaluationContext } from "@/lib/gscae/badges";

function baseContext(
  overrides?: Partial<BadgeEvaluationContext>,
): BadgeEvaluationContext {
  return {
    scaeLevel: null,
    totalScore: 0.5,
    habilidadeCode: "MA01",
    discipline: "MA",
    isFirstAttempt: false,
    isNewBestLevel: false,
    totalCompletions: 5,
    disciplineCompletions: 2,
    ...overrides,
  };
}

describe("evaluateBadgeCandidates", () => {
  describe("SCAE level badges", () => {
    it("should award CONHECE badge when new best level is CONHECE", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({
          scaeLevel: "CONHECE",
          isNewBestLevel: true,
        }),
      );

      expect(candidates).toContainEqual(
        expect.objectContaining({ badgeId: "scae_conhece" }),
      );
    });

    it("should award ENTENDE badge when new best level is ENTENDE", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({
          scaeLevel: "ENTENDE",
          isNewBestLevel: true,
        }),
      );

      expect(candidates).toContainEqual(
        expect.objectContaining({ badgeId: "scae_entende" }),
      );
    });

    it("should award APLICA badge when new best level is APLICA", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({
          scaeLevel: "APLICA",
          isNewBestLevel: true,
        }),
      );

      expect(candidates).toContainEqual(
        expect.objectContaining({ badgeId: "scae_aplica" }),
      );
    });

    it("should award RESOLVE badge when new best level is RESOLVE", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({
          scaeLevel: "RESOLVE",
          isNewBestLevel: true,
        }),
      );

      expect(candidates).toContainEqual(
        expect.objectContaining({ badgeId: "scae_resolve" }),
      );
    });

    it("should not award SCAE badge when isNewBestLevel is false", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({
          scaeLevel: "CONHECE",
          isNewBestLevel: false,
        }),
      );

      const scaeBadges = candidates.filter((c) =>
        c.badgeId.startsWith("scae_"),
      );
      expect(scaeBadges).toHaveLength(0);
    });

    it("should not award SCAE badge when scaeLevel is null", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({
          scaeLevel: null,
          isNewBestLevel: true,
        }),
      );

      const scaeBadges = candidates.filter((c) =>
        c.badgeId.startsWith("scae_"),
      );
      expect(scaeBadges).toHaveLength(0);
    });

    it("should include habilidadeCode and scaeLevel in context", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({
          scaeLevel: "APLICA",
          isNewBestLevel: true,
          habilidadeCode: "LP05",
        }),
      );

      const badge = candidates.find((c) => c.badgeId === "scae_aplica");
      expect(badge).toBeDefined();
      const context = JSON.parse(badge!.context!);
      expect(context.habilidadeCode).toBe("LP05");
      expect(context.scaeLevel).toBe("APLICA");
    });
  });

  describe("completion milestone badges", () => {
    it("should award primeira_ativ on first completion", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({ totalCompletions: 1 }),
      );

      expect(candidates).toContainEqual(
        expect.objectContaining({ badgeId: "primeira_ativ" }),
      );
    });

    it("should award dez_ativ on 10th completion", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({ totalCompletions: 10 }),
      );

      expect(candidates).toContainEqual(
        expect.objectContaining({ badgeId: "dez_ativ" }),
      );
    });

    it("should award cinquenta_ativ on 50th completion", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({ totalCompletions: 50 }),
      );

      expect(candidates).toContainEqual(
        expect.objectContaining({ badgeId: "cinquenta_ativ" }),
      );
    });

    it("should not award completion badges for other counts", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({ totalCompletions: 7 }),
      );

      const milestones = candidates.filter((c) =>
        ["primeira_ativ", "dez_ativ", "cinquenta_ativ"].includes(c.badgeId),
      );
      expect(milestones).toHaveLength(0);
    });
  });

  describe("score badges", () => {
    it("should award nota_perfeita for 100% score", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({ totalScore: 1.0 }),
      );

      expect(candidates).toContainEqual(
        expect.objectContaining({ badgeId: "nota_perfeita" }),
      );
    });

    it("should not award nota_perfeita for 99% score", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({ totalScore: 0.99 }),
      );

      expect(candidates).not.toContainEqual(
        expect.objectContaining({ badgeId: "nota_perfeita" }),
      );
    });

    it("should award acima_media for 80%+ on first attempt", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({
          totalScore: 0.85,
          isFirstAttempt: true,
        }),
      );

      expect(candidates).toContainEqual(
        expect.objectContaining({ badgeId: "acima_media" }),
      );
    });

    it("should not award acima_media for 80%+ on non-first attempt", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({
          totalScore: 0.85,
          isFirstAttempt: false,
        }),
      );

      expect(candidates).not.toContainEqual(
        expect.objectContaining({ badgeId: "acima_media" }),
      );
    });

    it("should not award acima_media for 79% on first attempt", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({
          totalScore: 0.79,
          isFirstAttempt: true,
        }),
      );

      expect(candidates).not.toContainEqual(
        expect.objectContaining({ badgeId: "acima_media" }),
      );
    });

    it("should award both nota_perfeita and acima_media for 100% first attempt", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({
          totalScore: 1.0,
          isFirstAttempt: true,
        }),
      );

      expect(candidates).toContainEqual(
        expect.objectContaining({ badgeId: "nota_perfeita" }),
      );
      expect(candidates).toContainEqual(
        expect.objectContaining({ badgeId: "acima_media" }),
      );
    });
  });

  describe("discipline badges", () => {
    it("should award disc_ma for 5 MA completions", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({
          discipline: "MA",
          disciplineCompletions: 5,
        }),
      );

      expect(candidates).toContainEqual(
        expect.objectContaining({ badgeId: "disc_ma" }),
      );
    });

    it("should award disc_lp for 5 LP completions", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({
          discipline: "LP",
          disciplineCompletions: 5,
        }),
      );

      expect(candidates).toContainEqual(
        expect.objectContaining({ badgeId: "disc_lp" }),
      );
    });

    it("should award disc_ci for 5 CI completions", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({
          discipline: "CI",
          disciplineCompletions: 5,
        }),
      );

      expect(candidates).toContainEqual(
        expect.objectContaining({ badgeId: "disc_ci" }),
      );
    });

    it("should award disc_in for 5 IN completions", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({
          discipline: "IN",
          disciplineCompletions: 5,
        }),
      );

      expect(candidates).toContainEqual(
        expect.objectContaining({ badgeId: "disc_in" }),
      );
    });

    it("should not award discipline badge for less than 5 completions", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({
          discipline: "MA",
          disciplineCompletions: 4,
        }),
      );

      expect(candidates).not.toContainEqual(
        expect.objectContaining({ badgeId: "disc_ma" }),
      );
    });

    it("should not award discipline badge for unknown discipline", () => {
      const candidates = evaluateBadgeCandidates(
        baseContext({
          discipline: "XX",
          disciplineCompletions: 10,
        }),
      );

      const discBadges = candidates.filter((c) =>
        c.badgeId.startsWith("disc_"),
      );
      expect(discBadges).toHaveLength(0);
    });
  });

  describe("multiple badges at once", () => {
    it("should award multiple badges when all criteria are met", () => {
      const candidates = evaluateBadgeCandidates({
        scaeLevel: "CONHECE",
        totalScore: 1.0,
        habilidadeCode: "MA01",
        discipline: "MA",
        isFirstAttempt: true,
        isNewBestLevel: true,
        totalCompletions: 1,
        disciplineCompletions: 5,
      });

      const badgeIds = candidates.map((c) => c.badgeId);
      expect(badgeIds).toContain("scae_conhece");
      expect(badgeIds).toContain("primeira_ativ");
      expect(badgeIds).toContain("nota_perfeita");
      expect(badgeIds).toContain("acima_media");
      expect(badgeIds).toContain("disc_ma");
      expect(candidates.length).toBe(5);
    });

    it("should return empty array when no criteria are met", () => {
      const candidates = evaluateBadgeCandidates(baseContext());

      expect(candidates).toHaveLength(0);
    });
  });
});
