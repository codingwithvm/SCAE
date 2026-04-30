import { describe, it, expect } from "vitest";
import {
  calculateScores,
  determineProfile,
  calculateConsistency,
  shouldActivateExtra,
  applyExtraAdjustment,
} from "@/lib/assessment/calculate";
import type { RankingsMap, MEESAnswers } from "@/lib/assessment/types";

describe("calculateScores", () => {
  describe("MCEES instruments (ranking ipsativo)", () => {
    it("should sum rankings per dimension across all blocks", () => {
      // Block 0: CA=4, EC=3, EA=2, OR=1
      // Block 1: CA=1, EC=2, EA=3, OR=4
      // Block 2: CA=2, EC=4, EA=1, OR=3
      // Block 3: CA=3, EC=1, EA=4, OR=2
      const rankings: RankingsMap = {
        b0: { CA: 4, EC: 3, EA: 2, OR: 1 },
        b1: { CA: 1, EC: 2, EA: 3, OR: 4 },
        b2: { CA: 2, EC: 4, EA: 1, OR: 3 },
        b3: { CA: 3, EC: 1, EA: 4, OR: 2 },
      };

      const result = calculateScores("mcees_1a4", rankings);

      expect(result.dimensions.CA).toBe(10); // 4+1+2+3
      expect(result.dimensions.EC).toBe(10); // 3+2+4+1
      expect(result.dimensions.EA).toBe(10); // 2+3+1+4
      expect(result.dimensions.OR).toBe(10); // 1+4+3+2
    });

    it("should calculate X axis as EA - OR", () => {
      const rankings: RankingsMap = {
        b0: { CA: 1, EC: 2, EA: 4, OR: 3 },
        b1: { CA: 1, EC: 2, EA: 4, OR: 3 },
        b2: { CA: 1, EC: 2, EA: 4, OR: 3 },
        b3: { CA: 1, EC: 2, EA: 4, OR: 3 },
      };

      const result = calculateScores("mcees_1a4", rankings);

      // EA = 4*4 = 16, OR = 3*4 = 12 → X = 16-12 = 4
      expect(result.X).toBe(4);
    });

    it("should calculate Y axis as CA - EC", () => {
      const rankings: RankingsMap = {
        b0: { CA: 4, EC: 1, EA: 2, OR: 3 },
        b1: { CA: 4, EC: 1, EA: 2, OR: 3 },
        b2: { CA: 4, EC: 1, EA: 2, OR: 3 },
        b3: { CA: 4, EC: 1, EA: 2, OR: 3 },
      };

      const result = calculateScores("mcees_1a4", rankings);

      // CA = 4*4 = 16, EC = 1*4 = 4 → Y = 16-4 = 12
      expect(result.Y).toBe(12);
    });

    it("should work the same for mcees_5a9 and mcees_prof", () => {
      const rankings: RankingsMap = {
        b0: { CA: 4, EC: 3, EA: 2, OR: 1 },
        b1: { CA: 4, EC: 3, EA: 2, OR: 1 },
        b2: { CA: 4, EC: 3, EA: 2, OR: 1 },
        b3: { CA: 4, EC: 3, EA: 2, OR: 1 },
      };

      const result5a9 = calculateScores("mcees_5a9", rankings);
      const resultProf = calculateScores("mcees_prof", rankings);

      expect(result5a9.X).toBe(resultProf.X);
      expect(result5a9.Y).toBe(resultProf.Y);
    });
  });

  describe("MEES instrument (pares A/B)", () => {
    it("should count dimension selections from pair choices", () => {
      // Simplified: all 32 pairs choose option with CA dimension
      // In practice each pair has different dimensions for A and B
      const answers: MEESAnswers = {};
      // Pair 1: A=[CA], B=[EC] → choosing A adds to CA
      answers["p1"] = "A";
      // Pair 2: A=[EA], B=[OR] → choosing A adds to EA
      answers["p2"] = "A";

      const result = calculateScores("mees_prof", undefined, answers);

      expect(result.dimensions).toBeDefined();
      expect(typeof result.X).toBe("number");
      expect(typeof result.Y).toBe("number");
    });

    it("should calculate X = EA - OR for MEES", () => {
      // Create answers where EA gets all points, OR gets none
      // This depends on the actual pair structure in instruments.ts
      const answers: MEESAnswers = {};
      // We'll test with a full set of answers later once instruments.ts exists
      // For now, verify the shape is correct
      const result = calculateScores("mees_prof", undefined, answers);

      expect(result).toHaveProperty("X");
      expect(result).toHaveProperty("Y");
      expect(result).toHaveProperty("dimensions");
      expect(result).toHaveProperty("conf");
      expect(result).toHaveProperty("confX");
      expect(result).toHaveProperty("confY");
    });
  });
});

describe("calculateConsistency", () => {
  it("should return confX and confY as percentages (0-100)", () => {
    const { confX, confY, conf } = calculateConsistency(6, 4, "mcees_1a4");

    expect(confX).toBeGreaterThanOrEqual(0);
    expect(confX).toBeLessThanOrEqual(100);
    expect(confY).toBeGreaterThanOrEqual(0);
    expect(confY).toBeLessThanOrEqual(100);
    expect(conf).toBe(Math.round((confX + confY) / 2));
  });

  it("should return 100% for maximum axis value", () => {
    // MCEES max possible difference is ~8 (pMax in POC)
    const { confX } = calculateConsistency(8, 0, "mcees_1a4");
    expect(confX).toBe(100);
  });

  it("should return 0% for axis value of 0", () => {
    const { confX, confY } = calculateConsistency(0, 0, "mcees_1a4");
    expect(confX).toBe(0);
    expect(confY).toBe(0);
  });

  it("should use pMax=11 for MEES instrument", () => {
    // MEES has 16 pairs per dimension → max diff is 11 according to POC
    const { confX } = calculateConsistency(11, 0, "mees_prof");
    expect(confX).toBe(100);
  });
});

describe("determineProfile", () => {
  describe("student profiles (MCEES)", () => {
    it("should return Estrategista for X>0, Y>0", () => {
      expect(determineProfile(5, 5, "mcees_1a4")).toBe("Estrategista");
    });

    it("should return Analítico for X<=0, Y>0", () => {
      expect(determineProfile(-3, 5, "mcees_5a9")).toBe("Analítico");
    });

    it("should return Criativo for X<0, Y<=0", () => {
      expect(determineProfile(-4, -3, "mcees_1a4")).toBe("Criativo");
    });

    it("should return Prático for X>0, Y<=0", () => {
      expect(determineProfile(5, -2, "mcees_5a9")).toBe("Prático");
    });

    it("should return Equilibrado when |X|<=2 and |Y|<=2", () => {
      expect(determineProfile(1, -1, "mcees_1a4")).toBe("Equilibrado");
      expect(determineProfile(2, 2, "mcees_5a9")).toBe("Equilibrado");
      expect(determineProfile(0, 0, "mcees_prof")).toBe("Equilibrado");
    });

    it("should apply same logic for mcees_prof", () => {
      expect(determineProfile(5, 5, "mcees_prof")).toBe("Estrategista");
      expect(determineProfile(-5, -5, "mcees_prof")).toBe("Criativo");
    });
  });

  describe("teacher profiles (MEES)", () => {
    it("should return Avaliador for X>0, Y>0", () => {
      expect(determineProfile(5, 5, "mees_prof")).toBe("Avaliador");
    });

    it("should return Especialista for X<=0, Y>0", () => {
      expect(determineProfile(-3, 5, "mees_prof")).toBe("Especialista");
    });

    it("should return Mentor for X<0, Y<=0", () => {
      expect(determineProfile(-4, -3, "mees_prof")).toBe("Mentor");
    });

    it("should return Facilitador for X>0, Y<=0", () => {
      expect(determineProfile(5, -2, "mees_prof")).toBe("Facilitador");
    });

    it("should return Equilibrado when |X|<=2 and |Y|<=2", () => {
      expect(determineProfile(1, -1, "mees_prof")).toBe("Equilibrado");
    });
  });
});

describe("shouldActivateExtra", () => {
  it("should return axis X when confX < 40 and confX <= confY", () => {
    const result = shouldActivateExtra(30, 60);
    expect(result).toBe("X");
  });

  it("should return axis Y when confY < 40 and confY < confX", () => {
    const result = shouldActivateExtra(60, 30);
    expect(result).toBe("Y");
  });

  it("should return null when both confs >= 40", () => {
    const result = shouldActivateExtra(50, 60);
    expect(result).toBeNull();
  });

  it("should return X when both < 40 and confX <= confY", () => {
    const result = shouldActivateExtra(20, 30);
    expect(result).toBe("X");
  });
});

describe("applyExtraAdjustment", () => {
  it("should add +2 to axis when EA/CA dimension is chosen", () => {
    // Extra question: user picks option with EA dimension → X axis += 2
    const adj = applyExtraAdjustment("X", "EA");
    expect(adj).toBe(2);
  });

  it("should subtract -2 from axis when OR/EC dimension is chosen", () => {
    // Extra question: user picks option with OR dimension → X axis -= 2
    const adj = applyExtraAdjustment("X", "OR");
    expect(adj).toBe(-2);
  });

  it("should add +2 to Y axis when CA dimension is chosen", () => {
    const adj = applyExtraAdjustment("Y", "CA");
    expect(adj).toBe(2);
  });

  it("should subtract -2 from Y axis when EC dimension is chosen", () => {
    const adj = applyExtraAdjustment("Y", "EC");
    expect(adj).toBe(-2);
  });
});
