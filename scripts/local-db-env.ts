import { existsSync, readFileSync, writeFileSync } from "node:fs";

const ENV_LOCAL_PATH = ".env.local";
const LOCAL_DATABASE_URL =
  "postgres://necatech:necatech_local_password@localhost:54329/necatech_boilerplate";

const defaults = new Map([
  ["DATABASE_URL", LOCAL_DATABASE_URL],
  ["APP_ENV", "dev"],
  ["CLIENT_SLUG", "client"],
  ["PROJECT_SLUG", "project"],
  ["LOCAL_AUTH_ENABLED", "true"],
]);

const sensitiveKeys = new Set([
  "BETTER_AUTH_SECRET",
  "FOUNDER_EMAIL",
  "FOUNDER_NAME",
  "FOUNDER_INITIAL_PASSWORD",
]);

function hasFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

function parseEnv(content: string) {
  const values = new Map<string, string>();
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const key = match[1];
    const value = match[2];
    if (!key || value === undefined) continue;
    values.set(key, value);
  }
  return values;
}

function serializeEnv(values: Map<string, string>) {
  return `${Array.from(values.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")}\n`;
}

function main() {
  const force = hasFlag("force");
  const existing = existsSync(ENV_LOCAL_PATH)
    ? readFileSync(ENV_LOCAL_PATH, "utf8")
    : "";
  const values = parseEnv(existing);
  const changed: string[] = [];
  const preservedSensitive = Array.from(sensitiveKeys).filter((key) =>
    values.has(key),
  );

  for (const [key, value] of defaults) {
    if (!values.has(key) || (key === "DATABASE_URL" && force)) {
      values.set(key, value);
      changed.push(key);
    }
  }

  writeFileSync(ENV_LOCAL_PATH, serializeEnv(values));

  console.info(
    [
      "Local DB env ready",
      `file=${ENV_LOCAL_PATH}`,
      `changed=${changed.length > 0 ? changed.join(",") : "none"}`,
      `preservedSensitive=${
        preservedSensitive.length > 0 ? preservedSensitive.join(",") : "none"
      }`,
      `database=${LOCAL_DATABASE_URL.replace(
        "necatech_local_password",
        "***",
      )}`,
    ].join("\n"),
  );
}

main();
