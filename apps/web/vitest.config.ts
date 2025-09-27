import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const projectRoot = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    globals: true,
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage"
    }
  },
  resolve: {
    alias: {
      "@": projectRoot,
      "@strategybuilder/shared": fileURLToPath(new URL("../../packages/shared/src", import.meta.url))
    }
  },
  esbuild: {
    jsx: "automatic"
  }
});
