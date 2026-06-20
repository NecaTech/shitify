// @vitest-environment node

import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const repoRoot = process.cwd();
const scriptPath = join(repoRoot, "scripts/assert-safe-db-env.ts");

function runGuard(
  operation: string,
  env: Record<string, string | undefined>,
  args: string[] = [],
) {
  return spawnSync("pnpm", ["exec", "tsx", scriptPath, operation, ...args], {
    cwd: repoRoot,
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
    const result = runGuard("pull-env", {}, ["--pull-environment=production"]);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "pull-env production can overwrite .env.local",
    );
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
