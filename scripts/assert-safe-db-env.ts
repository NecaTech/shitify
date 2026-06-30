import { Pool as NeonPool } from "@neondatabase/serverless";
import { config } from "dotenv";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Pool as PgPool } from "pg";
import { classifyDatabaseUrl } from "../src/lib/db/database-url";
import {
  APP_ENVS,
  getDatabaseSchemaNameFromParts,
  validateAppEnv,
  type AppEnv,
} from "../src/lib/db/schema-name";

type Operation =
  | "generate"
  | "migrate"
  | "push"
  | "studio"
  | "seed"
  | "reset"
  | "pull-env"
  | "bootstrap";

const operations = new Set<Operation>([
  "generate",
  "migrate",
  "push",
  "studio",
  "seed",
  "reset",
  "pull-env",
  "bootstrap",
]);

config({ path: ".env.local" });
config({ path: ".env" });

function getArg(name: string) {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value?.slice(prefix.length).trim() ?? "";
}

function hasFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

function fail(message: string): never {
  console.error(`DB guard refused: ${message}`);
  process.exit(1);
}

function readEnvFile(path: string) {
  if (!existsSync(path)) return new Map<string, string>();

  const values = new Map<string, string>();
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const key = match[1];
    const rawValue = match[2];
    if (!key || rawValue === undefined) continue;

    values.set(key, rawValue.replace(/^(['"])(.*)\1$/, "$2").trim());
  }

  return values;
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) fail(`${name} is required`);
  return value;
}

function getAppEnv(): AppEnv {
  const value = requiredEnv("APP_ENV");
  try {
    validateAppEnv(value);
  } catch (error) {
    fail(error instanceof Error ? error.message : "Invalid APP_ENV");
  }
  return value;
}

function getDatabaseSchemaName(appEnv: AppEnv) {
  const clientSlug = requiredEnv("CLIENT_SLUG");
  const projectSlug = requiredEnv("PROJECT_SLUG");

  try {
    return getDatabaseSchemaNameFromParts({ appEnv, clientSlug, projectSlug });
  } catch (error) {
    fail(
      error instanceof Error ? error.message : "Invalid database schema name",
    );
  }
}

function parseDatabaseUrl() {
  const databaseUrl = requiredEnv("DATABASE_URL");
  try {
    return new URL(databaseUrl);
  } catch {
    fail("DATABASE_URL must be a valid URL");
  }
}

function redactDatabaseUrl(url: URL) {
  const redacted = new URL(url.toString());
  if (redacted.username) redacted.username = "***";
  if (redacted.password) redacted.password = "***";
  return redacted.toString();
}

function assertConfirmation(name: string, expected: string, reason: string) {
  const value = process.env[name]?.trim();
  if (value !== expected) {
    fail(`${reason}. Set ${name}=${expected} to confirm explicitly.`);
  }
}

function getPullEnvTarget() {
  const target =
    getArg("vercel-env") ||
    getArg("pull-environment") ||
    getArg("target") ||
    process.env.VERCEL_ENV_TARGET ||
    "production";

  if (["prod", "production"].includes(target)) return "production";
  if (["staging", "preview"].includes(target)) return "preview";
  if (["dev", "development"].includes(target)) return "development";
  fail(`Unsupported pull-env target: ${target}`);
}

async function ensureSchema(
  schemaName: string,
  databaseUrl: string,
  databaseKind: ReturnType<typeof classifyDatabaseUrl>,
) {
  if (databaseKind === "local") {
    const pool = new PgPool({ connectionString: databaseUrl });
    try {
      await pool.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    } finally {
      await pool.end();
    }
    return;
  }

  const pool = new NeonPool({ connectionString: databaseUrl });
  try {
    await pool.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
  } finally {
    await pool.end();
  }
}

async function main() {
  const operation = process.argv[2] as Operation | undefined;
  if (!operation || !operations.has(operation)) {
    fail(`operation must be one of: ${Array.from(operations).join(", ")}`);
  }

  if (operation === "pull-env") {
    const target = getPullEnvTarget();
    if (target === "production" && existsSync(resolve(".env.local"))) {
      assertConfirmation(
        "CONFIRM_PULL_ENV_PROD",
        "overwrite-env-local",
        "pull-env production can overwrite .env.local",
      );
    }
    console.info(`DB guard OK: pull-env target=${target}`);
    return;
  }

  const appEnv = getAppEnv();
  const schemaName = getDatabaseSchemaName(appEnv);
  const databaseUrl = parseDatabaseUrl();
  const databaseKind = classifyDatabaseUrl(databaseUrl);
  const localEnv = readEnvFile(".env.local");

  if (operation === "push" && appEnv !== "dev") {
    fail("db:push is allowed only when APP_ENV=dev");
  }

  if (operation === "seed" && appEnv === "prod") {
    fail("db:seed is forbidden when APP_ENV=prod");
  }

  if (operation === "reset" && appEnv === "prod") {
    fail("db:reset is forbidden when APP_ENV=prod");
  }

  if (operation === "push" && databaseKind === "production-suspect") {
    fail("db:push is forbidden on a production-looking DATABASE_URL");
  }

  if (operation === "reset" && databaseKind !== "local") {
    assertConfirmation(
      "CONFIRM_DB_RESET",
      schemaName,
      "db:reset against a non-local DATABASE_URL requires schema confirmation",
    );
  }

  if (appEnv === "prod" && databaseKind === "local") {
    fail("APP_ENV=prod cannot target a local DATABASE_URL");
  }

  if (
    appEnv !== "dev" &&
    localEnv.get("DATABASE_URL") === process.env.DATABASE_URL
  ) {
    console.warn(
      "DB guard warning: .env.local DATABASE_URL matches the target URL for a non-dev APP_ENV.",
    );
  }

  if (
    (operation === "migrate" || operation === "push") &&
    hasFlag("ensure-schema")
  ) {
    await ensureSchema(schemaName, databaseUrl.toString(), databaseKind);
  }

  console.info(
    [
      `DB guard OK: ${operation}`,
      `APP_ENV=${appEnv}`,
      `allowedAppEnvs=${APP_ENVS.join(",")}`,
      `schema=${schemaName}`,
      `database=${redactDatabaseUrl(databaseUrl)}`,
      `databaseKind=${databaseKind}`,
    ].join("\n"),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
