import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

type Severity = "pass" | "warn" | "fail";

type CheckResult = {
  name: string;
  severity: Severity;
  detail?: string | undefined;
};

const root = process.cwd();
const shouldRunSlowChecks = !process.argv.includes("--static");

const results: CheckResult[] = [];

function add(result: CheckResult) {
  results.push(result);
}

function read(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

function runCommand(name: string, command: string, args: string[]) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.status === 0) {
    add({ name, severity: "pass" });
    return;
  }

  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  add({
    name,
    severity: "fail",
    detail: output.split("\n").slice(-8).join("\n") || "Command failed",
  });
}

function checkFileExists(path: string, name = path) {
  add({
    name,
    severity: existsSync(join(root, path)) ? "pass" : "fail",
    detail: existsSync(join(root, path)) ? undefined : `${path} is missing`,
  });
}

function getEnvExampleKeys() {
  if (!existsSync(join(root, ".env.example"))) return new Set<string>();
  const content = read(".env.example");
  return new Set(
    content
      .split("\n")
      .map((line) => line.match(/^([A-Z0-9_]+)=/)?.[1])
      .filter((key): key is string => Boolean(key)),
  );
}

function getAuthenticatedRoutes(): string[] {
  const dir = join(root, "src/app/(authenticated)");
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((entry) => statSync(join(dir, entry)).isDirectory())
    .map((entry) => `/${entry}`);
}

function getProxyMatchers(): string[] {
  const proxyPath = join(root, "src/proxy.ts");
  if (!existsSync(proxyPath)) return [];

  const proxy = read("src/proxy.ts");
  const matcherBlock = proxy.match(/matcher:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
  return Array.from(matcherBlock.matchAll(/"([^"]+)"/g))
    .map((match) => match[1])
    .filter((matcher): matcher is string => Boolean(matcher))
    .map((matcher) => matcher.replace(/\/:path\*$/, ""));
}

function checkStaticReadiness() {
  checkFileExists("README.md");
  checkFileExists("AGENT.md");
  checkFileExists("package.json");
  checkFileExists(".env.example");
  checkFileExists("src/lib/env.ts");
  checkFileExists("src/lib/auth/index.ts");
  checkFileExists("src/proxy.ts");
  checkFileExists("next.config.ts");

  const envKeys = getEnvExampleKeys();
  for (const key of [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "NEXT_PUBLIC_APP_URL",
  ]) {
    add({
      name: `.env.example declares ${key}`,
      severity: envKeys.has(key) ? "pass" : "fail",
      detail: envKeys.has(key) ? undefined : `Missing ${key} in .env.example`,
    });
  }

  const authConfig = existsSync(join(root, "src/lib/auth/index.ts"))
    ? read("src/lib/auth/index.ts")
    : "";
  add({
    name: "Email verification",
    severity: /requireEmailVerification:\s*true/.test(authConfig)
      ? "pass"
      : "warn",
    detail: /requireEmailVerification:\s*true/.test(authConfig)
      ? undefined
      : "Disabled. OK for local pilots, not for real production.",
  });

  const nextConfig = existsSync(join(root, "next.config.ts"))
    ? read("next.config.ts")
    : "";
  add({
    name: "CSP unsafe-inline",
    severity: nextConfig.includes("'unsafe-inline'") ? "warn" : "pass",
    detail: nextConfig.includes("'unsafe-inline'")
      ? "CSP still allows unsafe-inline. Replace with nonces before production."
      : undefined,
  });
  add({
    name: "CSP connect-src",
    severity: nextConfig.includes("connect-src 'self'") ? "warn" : "pass",
    detail: nextConfig.includes("connect-src 'self'")
      ? "connect-src only allows self. Add Neon, analytics, and external APIs per project."
      : undefined,
  });

  const routes = getAuthenticatedRoutes();
  const matchers = getProxyMatchers();
  const missingRoutes = routes.filter((route) => !matchers.includes(route));
  add({
    name: "Protected routes match proxy matcher",
    severity: missingRoutes.length === 0 ? "pass" : "fail",
    detail:
      missingRoutes.length === 0
        ? undefined
        : `Missing in proxy matcher: ${missingRoutes.join(", ")}`,
  });

  const migrationsDir = join(root, "src/lib/db/migrations");
  const hasMigrations =
    existsSync(migrationsDir) &&
    readdirSync(migrationsDir).some((entry) => entry.endsWith(".sql"));
  add({
    name: "Database migrations",
    severity: hasMigrations ? "pass" : "warn",
    detail: hasMigrations
      ? undefined
      : "No SQL migration found. Expected before a deployed pilot with database state.",
  });

  const appLayout = existsSync(join(root, "src/app/layout.tsx"))
    ? read("src/app/layout.tsx")
    : "";
  add({
    name: "App metadata customized",
    severity: appLayout.includes("TODO: describe your app") ? "warn" : "pass",
    detail: appLayout.includes("TODO: describe your app")
      ? "Root metadata still contains the boilerplate TODO description."
      : undefined,
  });

  const todoOutput = spawnSync("rg", ["-n", "TODO\\(init-project\\)", "."], {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe",
  });
  const todoMatches = (todoOutput.stdout ?? "")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .filter((line) => !line.startsWith("README.md:"));
  add({
    name: "Project initialization TODOs",
    severity: todoMatches.length === 0 ? "pass" : "warn",
    detail:
      todoMatches.length === 0
        ? undefined
        : `${todoMatches.length} TODO(init-project) marker(s) remain outside README.`,
  });
}

function printResults() {
  const icon: Record<Severity, string> = {
    pass: "OK",
    warn: "WARN",
    fail: "FAIL",
  };

  console.log("\nNecaTech readiness\n");
  for (const result of results) {
    console.log(`${icon[result.severity].padEnd(4)} ${result.name}`);
    if (result.detail) console.log(`     ${result.detail}`);
  }

  const failures = results.filter((result) => result.severity === "fail");
  const warnings = results.filter((result) => result.severity === "warn");

  const status =
    failures.length > 0
      ? "NOT_READY"
      : warnings.length > 0
        ? "PILOT_READY_WITH_WARNINGS"
        : "PRODUCTION_READY";

  console.log(`\nStatus: ${status}`);
  console.log(
    `Checks: ${results.length - failures.length - warnings.length} OK, ${warnings.length} warning(s), ${failures.length} failure(s)\n`,
  );

  if (failures.length > 0) process.exit(1);
}

if (shouldRunSlowChecks) {
  runCommand("TypeScript", "pnpm", ["typecheck"]);
  runCommand("ESLint", "pnpm", ["lint"]);
  runCommand("Prettier", "pnpm", ["format:check"]);
  runCommand("Tests", "pnpm", ["test"]);
}

checkStaticReadiness();
printResults();
