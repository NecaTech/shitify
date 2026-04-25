import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import type { UserConfig } from "vite";

export default defineConfig(async (): Promise<UserConfig> => {
  const { default: tsconfigPaths } = await import("vite-tsconfig-paths");

  return {
    plugins: [react(), tsconfigPaths()],

    test: {
      environment: "jsdom",
      globals: true,
      include: ["**/*.test.{ts,tsx}"],
      exclude: ["node_modules", "dist", ".next"],
    },
  };
});
