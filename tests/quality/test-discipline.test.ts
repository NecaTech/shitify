// @vitest-environment node

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { globSync } from "node:fs";

const repoRoot = process.cwd();

function testFiles() {
  return globSync("tests/**/*.{test,spec}.{ts,tsx}", {
    cwd: repoRoot,
  })
    .map((path) => join(repoRoot, path))
    .filter((path) => !path.endsWith("test-discipline.test.ts"));
}

describe("test suite discipline", () => {
  it("does not commit focused tests", () => {
    const offenders = testFiles().filter((path) =>
      /\b(?:describe|it|test)\.only\s*\(/.test(readFileSync(path, "utf8")),
    );

    expect(offenders.map((path) => relative(repoRoot, path))).toEqual([]);
  });

  it("does not skip tests without making the debt explicit", () => {
    const offenders = testFiles().filter((path) => {
      const content = readFileSync(path, "utf8");
      return /\b(?:describe|it|test)\.skip\s*\(/.test(content);
    });

    expect(offenders.map((path) => relative(repoRoot, path))).toEqual([]);
  });
});
