import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("module", () => ({
  createRequire: vi.fn(),
}));

vi.mock("path", () => ({
  default: { join: vi.fn(() => "/fake/path/gen_simulador_v4.cjs") },
  join: vi.fn(() => "/fake/path/gen_simulador_v4.cjs"),
}));

const mockGenerateHTML = vi.fn();
const mockValidateConfig = vi.fn();

const { createRequire } = await import("module");
const mockedCreateRequire = vi.mocked(createRequire);

function setupModuleAvailable() {
  mockedCreateRequire.mockReturnValue((() => ({
    generateHTML: mockGenerateHTML,
    validateConfig: mockValidateConfig,
  })) as never);
}

function setupModuleUnavailable() {
  mockedCreateRequire.mockReturnValue((() => {
    throw new Error("Module not found");
  }) as never);
}

describe("gen-simulador wrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("isAvailable", () => {
    it("should return true when module loads successfully", async () => {
      setupModuleAvailable();
      const { isAvailable } = await import("@/lib/gscae/gen-simulador");
      expect(isAvailable()).toBe(true);
    });

    it("should return false when module fails to load", async () => {
      setupModuleUnavailable();
      const { isAvailable } = await import("@/lib/gscae/gen-simulador");
      expect(isAvailable()).toBe(false);
    });
  });

  describe("validateConfig", () => {
    it("should throw when module is not available", async () => {
      setupModuleUnavailable();
      const { validateConfig } = await import("@/lib/gscae/gen-simulador");
      expect(() => validateConfig({})).toThrow("not available");
    });

    it("should delegate to module validateConfig when available", async () => {
      setupModuleAvailable();
      const { validateConfig } = await import("@/lib/gscae/gen-simulador");
      validateConfig({ key: "value" });
      expect(mockValidateConfig).toHaveBeenCalledWith({ key: "value" });
    });

    it("should propagate validation errors from module", async () => {
      setupModuleAvailable();
      mockValidateConfig.mockImplementation(() => {
        throw new Error("Invalid config");
      });
      const { validateConfig } = await import("@/lib/gscae/gen-simulador");
      expect(() => validateConfig({})).toThrow("Invalid config");
    });
  });

  describe("tryGenerateHTML", () => {
    it("should return null when module is not available", async () => {
      setupModuleUnavailable();
      const { tryGenerateHTML } = await import("@/lib/gscae/gen-simulador");
      expect(tryGenerateHTML({})).toBeNull();
    });

    it("should return null when generateHTML throws", async () => {
      setupModuleAvailable();
      mockGenerateHTML.mockImplementation(() => {
        throw new Error("Generation failed");
      });
      const { tryGenerateHTML } = await import("@/lib/gscae/gen-simulador");
      expect(tryGenerateHTML({})).toBeNull();
    });

    it("should return HTML string on success", async () => {
      setupModuleAvailable();
      mockGenerateHTML.mockReturnValue("<html>test</html>");
      const { tryGenerateHTML } = await import("@/lib/gscae/gen-simulador");
      expect(tryGenerateHTML({ key: "value" })).toBe("<html>test</html>");
    });
  });

  describe("generateHTML", () => {
    it("should throw when module is not available", async () => {
      setupModuleUnavailable();
      const { generateHTML } = await import("@/lib/gscae/gen-simulador");
      expect(() => generateHTML({})).toThrow("not available");
    });

    it("should return HTML when module is available", async () => {
      setupModuleAvailable();
      mockGenerateHTML.mockReturnValue("<html>result</html>");
      const { generateHTML } = await import("@/lib/gscae/gen-simulador");
      expect(generateHTML({ config: true })).toBe("<html>result</html>");
    });
  });
});
