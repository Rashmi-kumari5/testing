import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  test: {
    environment: "node",
    coverage: {
      reportsDirectory: "coverage",
      reporter: ["text", "json-summary"],
      include: ["lib/**/*.ts"],
    },
    include: ["tests/**/*.test.ts"],
  },
});
