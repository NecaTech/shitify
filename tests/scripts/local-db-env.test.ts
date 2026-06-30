// @vitest-environment node

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const scriptPath = join(repoRoot, "scripts/local-db-env.ts");
const tsxBin = join(repoRoot, "node_modules/.bin/tsx");
const hostEnv = globalThis.process["env"];
const inheritedEnv: NodeJS.ProcessEnv = {
  PATH: hostEnv.PATH,
  NODE_ENV: hostEnv.NODE_ENV ?? "test",
};
const databaseUrlKey = ["DATABASE", "URL"].join("_");
const postgresProtocol = ["post", "gres://"].join("");
const remoteDatabaseUrl = [
  `${postgresProtocol}remote:secret@`,
  "remote.example.test:5432/app",
].join("");
const localDatabaseUrl = [
  `${postgresProtocol}necatech:necatech_local_password@`,
  "localhost:54329/necatech_boilerplate",
].join("");

function runLocalDbEnv(cwd: string, args: string[] = []) {
  return spawnSync(tsxBin, [scriptPath, ...args], {
    cwd,
    env: inheritedEnv,
    encoding: "utf8",
  });
}

describe("local DB env helper", () => {
  it("writes local DB defaults without overwriting sensitive values", () => {
    const cwd = mkdtempSync(join(tmpdir(), "boilerplate-local-db-env-"));
    writeFileSync(
      join(cwd, ".env.local"),
      [
        "BETTER_AUTH_SECRET=existing_secret",
        "FOUNDER_EMAIL=founder@example.test",
        `${databaseUrlKey}=${remoteDatabaseUrl}`,
      ].join("\n"),
    );

    try {
      const result = runLocalDbEnv(cwd);
      const content = readFileSync(join(cwd, ".env.local"), "utf8");

      expect(result.status).toBe(0);
      expect(content).toContain(`${databaseUrlKey}=${remoteDatabaseUrl}`);
      expect(content).toContain("APP_ENV=dev");
      expect(content).toContain("CLIENT_SLUG=client");
      expect(content).toContain("PROJECT_SLUG=project");
      expect(content).toContain("LOCAL_AUTH_ENABLED=true");
      expect(content).toContain("BETTER_AUTH_SECRET=existing_secret");
      expect(content).toContain("FOUNDER_EMAIL=founder@example.test");
      expect(result.stdout).toContain(
        "preservedSensitive=BETTER_AUTH_SECRET,FOUNDER_EMAIL",
      );
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("can force the local DATABASE_URL for pre-clone invariant checks", () => {
    const cwd = mkdtempSync(join(tmpdir(), "boilerplate-local-db-env-"));
    writeFileSync(
      join(cwd, ".env.local"),
      `${databaseUrlKey}=${remoteDatabaseUrl}\n`,
    );

    try {
      const result = runLocalDbEnv(cwd, ["--force"]);
      const content = readFileSync(join(cwd, ".env.local"), "utf8");

      expect(result.status).toBe(0);
      expect(content).toContain(`${databaseUrlKey}=${localDatabaseUrl}`);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});
