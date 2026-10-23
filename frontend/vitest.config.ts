import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  test: {
    environment: "jsdom",

    setupFiles: [
      "./src/tests/setup.ts"
    ],

    clearMocks: true,

    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx"
    ],

    coverage: {
      provider: "v8",

      reporter: [
        "text",
        "html"
      ],

      include: [
        "src/**/*.{ts,tsx}"
      ],

      exclude: [
        "src/tests/**",
        "src/main.tsx",
        "src/**/*.d.ts"
      ]
    }
  }
});