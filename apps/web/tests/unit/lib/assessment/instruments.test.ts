import { describe, it, expect } from "vitest";
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

describe("instruments data integrity", () => {
  describe("MCEES_1A4", () => {
    it("should have exactly 4 blocks", () => {
      expect(MCEES_1A4).toHaveLength(4);
    });

    it("each block should have exactly 4 items", () => {
      MCEES_1A4.forEach((block) => {
        expect(block.items).toHaveLength(4);
      });
    });

    it("each block should cover all 4 dimensions exactly once", () => {
      MCEES_1A4.forEach((block) => {
        const dims = block.items.map((item) => item.d);
        expect(dims.sort()).toEqual(["CA", "EA", "EC", "OR"]);
      });
    });

    it("each block should have a title", () => {
      MCEES_1A4.forEach((block) => {
        expect(block.title).toBeTruthy();
        expect(typeof block.title).toBe("string");
      });
    });

    it("each item should have non-empty text", () => {
      MCEES_1A4.forEach((block) => {
        block.items.forEach((item) => {
          expect(item.t).toBeTruthy();
          expect(item.t.length).toBeGreaterThan(10);
        });
      });
    });
  });

  describe("MCEES_5A9", () => {
    it("should have exactly 4 blocks with 4 items each", () => {
      expect(MCEES_5A9).toHaveLength(4);
      MCEES_5A9.forEach((block) => {
        expect(block.items).toHaveLength(4);
      });
    });

    it("each block should cover all 4 dimensions", () => {
      MCEES_5A9.forEach((block) => {
        const dims = block.items.map((item) => item.d);
        expect(dims.sort()).toEqual(["CA", "EA", "EC", "OR"]);
      });
    });
  });

  describe("MCEES_PROF", () => {
    it("should have exactly 4 blocks with 4 items each", () => {
      expect(MCEES_PROF).toHaveLength(4);
      MCEES_PROF.forEach((block) => {
        expect(block.items).toHaveLength(4);
      });
    });

    it("each block should cover all 4 dimensions", () => {
      MCEES_PROF.forEach((block) => {
        const dims = block.items.map((item) => item.d);
        expect(dims.sort()).toEqual(["CA", "EA", "EC", "OR"]);
      });
    });
  });

  describe("MEES_PROF", () => {
    it("should have exactly 4 sections", () => {
      expect(MEES_PROF).toHaveLength(4);
    });

    it("each section should have exactly 8 pairs", () => {
      MEES_PROF.forEach((section) => {
        expect(section.pairs).toHaveLength(8);
      });
    });

    it("total pairs should be 32", () => {
      const total = MEES_PROF.reduce((sum, s) => sum + s.pairs.length, 0);
      expect(total).toBe(32);
    });

    it("each pair should have options A and B with different dimensions", () => {
      MEES_PROF.forEach((section) => {
        section.pairs.forEach((pair) => {
          expect(pair.A.d).toBeTruthy();
          expect(pair.B.d).toBeTruthy();
          expect(pair.A.d).not.toBe(pair.B.d);
        });
      });
    });

    it("each pair should have non-empty text for both options", () => {
      MEES_PROF.forEach((section) => {
        section.pairs.forEach((pair) => {
          expect(pair.A.t.length).toBeGreaterThan(10);
          expect(pair.B.t.length).toBeGreaterThan(10);
        });
      });
    });

    it("pairs should be numbered sequentially 1-32", () => {
      let expectedN = 1;
      MEES_PROF.forEach((section) => {
        section.pairs.forEach((pair) => {
          expect(pair.n).toBe(expectedN);
          expectedN++;
        });
      });
    });
  });

  describe("Extra questions (refinement)", () => {
    it("EXTRA_X should have exactly 3 pairs", () => {
      expect(EXTRA_X).toHaveLength(3);
    });

    it("EXTRA_Y should have exactly 3 pairs", () => {
      expect(EXTRA_Y).toHaveLength(3);
    });

    it("EXTRA_X_1A4 should have exactly 3 pairs", () => {
      expect(EXTRA_X_1A4).toHaveLength(3);
    });

    it("EXTRA_Y_1A4 should have exactly 3 pairs", () => {
      expect(EXTRA_Y_1A4).toHaveLength(3);
    });

    it("EXTRA_X pairs should involve OR and EA dimensions", () => {
      EXTRA_X.forEach((pair) => {
        const dims = [pair.A.d, pair.B.d].sort();
        expect(dims).toEqual(["EA", "OR"]);
      });
    });

    it("EXTRA_Y pairs should involve CA and EC dimensions", () => {
      EXTRA_Y.forEach((pair) => {
        const dims = [pair.A.d, pair.B.d].sort();
        expect(dims).toEqual(["CA", "EC"]);
      });
    });

    it("EXTRA_X_1A4 pairs should involve OR and EA dimensions", () => {
      EXTRA_X_1A4.forEach((pair) => {
        const dims = [pair.A.d, pair.B.d].sort();
        expect(dims).toEqual(["EA", "OR"]);
      });
    });

    it("EXTRA_Y_1A4 pairs should involve CA and EC dimensions", () => {
      EXTRA_Y_1A4.forEach((pair) => {
        const dims = [pair.A.d, pair.B.d].sort();
        expect(dims).toEqual(["CA", "EC"]);
      });
    });
  });
});
