import { spawnSync } from "node:child_process";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rawSchemaPath = resolve(root, "src/lib/db/auth-schema.generated.ts");
const rawSchemaCliOutput = "./src/lib/db/auth-schema.generated.ts";
const appSchemaPath = resolve(root, "src/lib/db/auth-schema.ts");
const cliAuthConfigPath = resolve(root, "src/lib/auth/.auth-cli.config.ts");
const expectedExports = [
  "user",
  "session",
  "account",
  "verification",
  "rateLimit",
];

config({ path: resolve(root, ".env.local") });
config({ path: resolve(root, ".env") });

function getExportedConstNames(source: string) {
  return new Set(
    Array.from(
      source.matchAll(/export\s+const\s+([A-Za-z_$][\w$]*)\s*=/g),
      (match) => match[1],
    ).filter((name): name is string => Boolean(name)),
  );
}

function assertExpectedExports(source: string, label: string) {
  const exports = getExportedConstNames(source);
  const missing = expectedExports.filter((name) => !exports.has(name));

  if (missing.length > 0) {
    throw new Error(`${label} is missing exports: ${missing.join(", ")}`);
  }
}

function writeCliAuthConfig() {
  const cliConfig = `import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

const db = {} as never;

export const auth = betterAuth({
  secret: "better-auth-schema-generation-secret",
  baseURL: "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        input: false,
        defaultValue: "user",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    requireEmailVerification: false,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/forget-password": { window: 60, max: 3 },
    },
  },
});
`;

  writeFileSync(cliAuthConfigPath, cliConfig);
  return cliAuthConfigPath;
}

function runBetterAuthGenerate(configPath: string) {
  const nodeOptions = [
    process.env.NODE_OPTIONS,
    "--conditions=react-server",
  ].filter(Boolean);

  const result = spawnSync(
    "pnpm",
    [
      "dlx",
      "@better-auth/cli@latest",
      "generate",
      "--config",
      configPath,
      "--output",
      rawSchemaCliOutput,
      "--yes",
    ],
    {
      cwd: root,
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_OPTIONS: nodeOptions.join(" "),
        SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION ?? "true",
      },
    },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `Better Auth schema generation failed with exit ${result.status}`,
    );
  }
}

function transformGeneratedSchema(source: string) {
  assertExpectedExports(source, "Generated Better Auth schema");

  if (!source.includes("pgTable(")) {
    throw new Error(
      "Generated Better Auth schema does not use pgTable(...); update the transform before continuing.",
    );
  }

  const withoutPgTableImport = source.replace(
    /import\s*{([^}]*)}\s*from\s*["']drizzle-orm\/pg-core["'];/,
    (_match: string, imports: string) => {
      const nextImports = imports
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0 && value !== "pgTable");

      if (nextImports.length === 0) {
        return "";
      }

      return `import {\n  ${nextImports.join(",\n  ")},\n} from "drizzle-orm/pg-core";`;
    },
  );

  const withAppSchemaImport = `import { appSchema } from "./app-schema";\n${withoutPgTableImport}`;

  const transformed = withAppSchemaImport.replaceAll(
    "pgTable(",
    "appSchema.table(",
  );

  assertExpectedExports(transformed, "Transformed Better Auth schema");

  if (
    /\bpgTable\s*(?:,|\})/.test(transformed) ||
    /\bpgTable\s*\(/.test(transformed)
  ) {
    throw new Error("Transformed Better Auth schema still references pgTable.");
  }

  if (!transformed.includes("appSchema.table(")) {
    throw new Error(
      "Transformed Better Auth schema does not use appSchema.table(...).",
    );
  }

  if (/\bpublic\b|["']public["']/.test(transformed)) {
    throw new Error(
      "Transformed Better Auth schema must not reference the public schema.",
    );
  }

  return transformed;
}

const configPath = writeCliAuthConfig();
try {
  runBetterAuthGenerate(configPath);
  writeFileSync(
    appSchemaPath,
    transformGeneratedSchema(readFileSync(rawSchemaPath, "utf8")),
  );
} finally {
  unlinkSync(cliAuthConfigPath);
}
