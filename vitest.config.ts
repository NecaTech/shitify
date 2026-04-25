import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Chargement asynchrone du plugin ESM-only
export default defineConfig(async () => {
  const tsconfigPaths = await import("vite-tsconfig-paths").then((m) =>
    m.default(),
  );

  return {
    plugins: [react(), tsconfigPaths],

    test: {
      environment: "jsdom",
      globals: true,
      include: ["**/*.test.{ts,tsx}"],
      exclude: ["node_modules", "dist", ".next"],
      // setupFiles: ['./src/test/setup.ts'], // décommentez si vous avez un fichier de setup
    },
  };
});
