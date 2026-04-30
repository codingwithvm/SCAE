import { defineConfig } from "vitest/config";
import { config } from "dotenv";
import path from "path";

config({ path: ".env.development" });

export default defineConfig({
  test: {
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    alias: {
      "server-only": path.resolve(
        __dirname,
        "./tests/__mocks__/server-only.ts",
      ),
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
