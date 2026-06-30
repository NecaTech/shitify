// @vitest-environment node

import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const scriptPath = join(repoRoot, "scripts/local-db-docker.ts");
const tsxBin = join(repoRoot, "node_modules/.bin/tsx");
const hostEnv = globalThis.process["env"];
const inheritedEnv: NodeJS.ProcessEnv = {
  PATH: hostEnv.PATH,
  NODE_ENV: hostEnv.NODE_ENV ?? "test",
};

function runLocalDbDocker(cwd: string, command: "up" | "down") {
  return spawnSync(tsxBin, [scriptPath, command], {
    cwd,
    env: {
      ...inheritedEnv,
      PATH: `${cwd}${delimiter}${inheritedEnv.PATH ?? ""}`,
    },
    encoding: "utf8",
  });
}

describe("local DB Docker helper", () => {
  it("creates the local Postgres container when it does not exist", () => {
    const cwd = mkdtempSync(join(tmpdir(), "boilerplate-local-db-docker-"));
    const logPath = join(cwd, "docker.log");
    const dockerPath = join(cwd, "docker");
    writeFileSync(
      dockerPath,
      [
        "#!/bin/sh",
        `printf '%s\\n' "$*" >> "${logPath}"`,
        'case "$1 $2" in',
        "  'container inspect') exit 1 ;;",
        "  'run -d') echo container_id; exit 0 ;;",
        "  *) exit 0 ;;",
        "esac",
      ].join("\n"),
    );
    chmodSync(dockerPath, 0o755);

    try {
      const result = runLocalDbDocker(cwd, "up");
      const log = readFileSync(logPath, "utf8");

      expect(result.status).toBe(0);
      expect(result.stdout).toContain(
        "Local DB created: necatech-boilerplate-postgres",
      );
      expect(log).toContain("run -d --name necatech-boilerplate-postgres");
      expect(log).toContain("-p 54329:5432");
      expect(log).toContain("postgres:16-alpine");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});
