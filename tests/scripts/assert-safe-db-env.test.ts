// @vitest-environment node

import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repoRoot = process.cwd();
const scriptPath = join(repoRoot, "scripts/assert-safe-db-env.ts");
const tsxBin = join(repoRoot, "node_modules/.bin/tsx");

function runGuard(
  operation: string,
  env: Record<string, string | undefined>,
  args: string[] = [],
  cwd = repoRoot,
) {
  return spawnSync(tsxBin, [scriptPath, operation, ...args], {
    cwd,
    env: {
      ...process.env,
      APP_ENV: "dev",
      CLIENT_SLUG: "example_client",
      PROJECT_SLUG: "example_project",
      DATABASE_URL: "postgres://user:password@localhost:5432/example",
      ...env,
    },
    encoding: "utf8",
  });
}

describe("safe database environment guard", () => {
  it("allows db:push only for APP_ENV=dev", () => {
    const result = runGuard("push", { APP_ENV: "staging" });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("db:push is allowed only when APP_ENV=dev");
  });

  it("blocks db:push on production-looking database URLs", () => {
    const result = runGuard("push", {
      DATABASE_URL:
        "postgres://user:password@production-db.example.com:5432/app",
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "db:push is forbidden on a production-looking DATABASE_URL",
    );
  });

  it("requires explicit confirmation before pulling production env into .env.local", () => {
    const cwd = mkdtempSync(join(tmpdir(), "boilerplate-db-guard-"));
    writeFileSync(join(cwd, ".env.local"), "APP_ENV=dev\n");

    try {
      const result = runGuard(
        "pull-env",
        {},
        ["--pull-environment=production"],
        cwd,
      );

      expect(result.status).toBe(1);
      expect(result.stderr).toContain(
        "pull-env production can overwrite .env.local",
      );
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("accepts production env pull only with explicit confirmation", () => {
    const result = runGuard(
      "pull-env",
      { CONFIRM_PULL_ENV_PROD: "overwrite-env-local" },
      ["--pull-environment=production"],
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("DB guard OK: pull-env target=production");
  });
});
