// @vitest-environment node

import { describe, expect, it } from "vitest";
import { readFileSync, globSync } from "node:fs";
import { join, relative } from "node:path";

const repoRoot = process.cwd();

function uiPrimitiveFiles() {
  return globSync("src/components/ui/**/*.{ts,tsx}", {
    cwd: repoRoot,
  }).map((path) => join(repoRoot, path));
}

describe("UI media URL boundary", () => {
  it("keeps UI primitives from rewriting caller-provided media URLs", () => {
    const offenders = uiPrimitiveFiles().filter((path) =>
      /from\s+["']next\/image["']/.test(readFileSync(path, "utf8")),
    );

    expect(offenders.map((path) => relative(repoRoot, path))).toEqual([]);
  });
});
