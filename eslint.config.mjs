import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import drizzle from "eslint-plugin-drizzle";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    plugins: { drizzle },
    rules: {
      "react/no-unescaped-entities": "off",
      // Drizzle safety: prevent accidental delete/update without where clause
      "drizzle/enforce-delete-with-where": "error",
      "drizzle/enforce-update-with-where": "error",
      // TypeScript import hygiene
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Enforce logger usage (lib/logger.ts) over console in production code
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  prettier,
]);

export default eslintConfig;
