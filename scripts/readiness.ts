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

function listFiles(dir: string, predicate: (path: string) => boolean) {
  const absolute = join(root, dir);
  if (!existsSync(absolute)) return [];

  const output: string[] = [];
  const visit = (current: string) => {
    for (const entry of readdirSync(current)) {
      if (
        [
          "node_modules",
          ".next",
          ".git",
          "coverage",
          ".drizzle-pgschema-spike",
        ].includes(entry)
      )
        continue;

      const absoluteEntry = join(current, entry);
      const relativeEntry = absoluteEntry.slice(root.length + 1);
      if (statSync(absoluteEntry).isDirectory()) {
        visit(absoluteEntry);
        continue;
      }
      if (predicate(relativeEntry)) output.push(relativeEntry);
    }
  };

  visit(absolute);
  return output.sort();
}

function isTsFile(path: string) {
  return /\.(ts|tsx|mts|cts)$/.test(path);
}

function hasServerOnlyImport(content: string) {
  return /import\s+["']server-only["']\s*;?/.test(content);
}

function importsRuntimeDb(content: string) {
  const importSources = Array.from(
    content.matchAll(/from\s+["']([^"']+)["']/g),
    (match) => match[1] ?? "",
  );

  return importSources.some((source) => {
    if (source === "@/lib/db" || source === "@/lib/db/index") return true;
    if (source.endsWith("/src/lib/db") || source.endsWith("/src/lib/db/index"))
      return true;
    return source.match(/^(\.\.?\/)+.*lib\/db(?:\/index)?$/);
  });
}

function referencesProductionDatabase(content: string) {
  return (
    /DATABASE_URL\s*[:=]/.test(content) ||
    /postgres(?:ql)?:\/\/[^\s"'`]+/i.test(content) ||
    /[a-z0-9-]+\.neon\.tech/i.test(content)
  );
}

function addBoundaryCheck(name: string, violations: string[]) {
  add({
    name,
    severity: violations.length === 0 ? "pass" : "fail",
    detail:
      violations.length === 0 ? undefined : violations.slice(0, 8).join("\n"),
  });
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

function getPackageScripts() {
  const packageJson = JSON.parse(read("package.json")) as {
    scripts?: Record<string, string>;
  };
  return packageJson.scripts ?? {};
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

function checkArchitectureBoundaries() {
  const sourceFiles = listFiles(".", (path) => isTsFile(path));

  const dbImportViolations = sourceFiles.filter((path) => {
    const content = read(path);
    if (!importsRuntimeDb(content)) return false;
    if (/^src\/features\/[^/]+\/repository\.ts$/.test(path)) return false;
    if (path === "src/lib/auth/index.ts") return false;
    return true;
  });
  addBoundaryCheck(
    "Architecture: @/lib/db import boundary",
    dbImportViolations,
  );

  const repositoryImportViolations = sourceFiles.filter((path) => {
    const content = read(path);
    const importsRepository =
      /from\s+["'][^"']*\/repository["']/.test(content) ||
      /from\s+["']@\/features\/[^"']+\/repository["']/.test(content);
    if (!importsRepository) return false;
    if (/\.test\.(ts|tsx)$/.test(path)) return false;
    if (/^src\/features\/[^/]+\/service\.ts$/.test(path)) return false;
    return true;
  });
  addBoundaryCheck(
    "Architecture: repository import boundary",
    repositoryImportViolations,
  );

  const uiFeatureImports = sourceFiles.filter((path) => {
    if (!path.startsWith("src/components/ui/")) return false;
    return read(path).match(/from\s+["']@\/features\//);
  });
  addBoundaryCheck(
    "Architecture: ui primitives are domain-agnostic",
    uiFeatureImports,
  );

  const processEnvViolations = sourceFiles.filter((path) => {
    if (!read(path).includes("process.env")) return false;
    if (path === "src/lib/env.ts") return false;
    if (path === "src/lib/db/index.ts") return false;
    if (path === "src/lib/db/schema-name.ts") return false;
    if (path === "src/lib/logger.ts") return false;
    if (path === "src/lib/auth/index.ts") return false;
    if (path === "drizzle.config.ts") return false;
    if (path === "playwright.config.ts") return false;
    if (path.startsWith("scripts/")) return false;
    return true;
  });
  addBoundaryCheck("Architecture: process.env boundary", processEnvViolations);

  const missingServerOnly = listFiles("src/features", (path) =>
    /\/(service|repository)\.ts$/.test(path),
  ).filter((path) => !hasServerOnlyImport(read(path)));
  addBoundaryCheck(
    "Architecture: server-only feature modules",
    missingServerOnly,
  );

  const dbPushScriptViolations = listFiles("scripts", (path) =>
    isTsFile(path),
  ).filter(
    (path) =>
      !["scripts/readiness.ts", "scripts/assert-safe-db-env.ts"].includes(
        path,
      ) && read(path).includes("db:push"),
  );
  addBoundaryCheck(
    "Architecture: no db:push in scripts",
    dbPushScriptViolations,
  );

  const prodDbTestViolations = listFiles("tests", (path) =>
    /\.(test|spec)\.(ts|tsx)$/.test(path),
  ).filter((path) => referencesProductionDatabase(read(path)));
  addBoundaryCheck(
    "Architecture: tests avoid prod/shared DB",
    prodDbTestViolations,
  );
}

function getExportedConstNames(content: string) {
  return new Set(
    Array.from(
      content.matchAll(/export\s+const\s+([A-Za-z_$][\w$]*)\s*=/g),
      (match) => match[1],
    ).filter((name): name is string => Boolean(name)),
  );
}

function checkAuthSchemaIsolation() {
  const authSchemaPath = "src/lib/db/auth-schema.ts";
  const generatedSchemaPath = "src/lib/db/auth-schema.generated.ts";
  const expectedAuthExports = [
    "user",
    "session",
    "account",
    "verification",
    "rateLimit",
  ];

  if (!existsSync(join(root, authSchemaPath))) {
    add({
      name: "Auth schema: active schema exists",
      severity: "fail",
      detail: `${authSchemaPath} is missing`,
    });
    return;
  }

  const authSchema = read(authSchemaPath);
  const activeExports = getExportedConstNames(authSchema);

  add({
    name: "Auth schema: uses app schema",
    severity:
      authSchema.includes("appSchema.table(") &&
      !/\bpgTable\s*(?:,|\})/.test(authSchema) &&
      !/\bpgTable\s*\(/.test(authSchema)
        ? "pass"
        : "fail",
    detail:
      authSchema.includes("appSchema.table(") &&
      !/\bpgTable\s*(?:,|\})/.test(authSchema) &&
      !/\bpgTable\s*\(/.test(authSchema)
        ? undefined
        : "Active Better Auth schema must use appSchema.table(...) and must not use pgTable directly.",
  });

  add({
    name: "Auth schema: no public schema references",
    severity: /\bpublic\b|["']public["']/.test(authSchema) ? "fail" : "pass",
    detail: /\bpublic\b|["']public["']/.test(authSchema)
      ? "Active Better Auth schema must not reference the public schema."
      : undefined,
  });

  const missingActiveExports = expectedAuthExports.filter(
    (name) => !activeExports.has(name),
  );
  add({
    name: "Auth schema: expected exports",
    severity: missingActiveExports.length === 0 ? "pass" : "fail",
    detail:
      missingActiveExports.length === 0
        ? undefined
        : `Missing exports: ${missingActiveExports.join(", ")}`,
  });

  if (!existsSync(join(root, generatedSchemaPath))) {
    add({
      name: "Auth schema: generated source exists",
      severity: "fail",
      detail: `${generatedSchemaPath} is missing`,
    });
  } else {
    const generatedSchema = read(generatedSchemaPath);
    const generatedExports = getExportedConstNames(generatedSchema);
    const missingGeneratedExports = expectedAuthExports.filter(
      (name) => !generatedExports.has(name),
    );
    add({
      name: "Auth schema: generated source expected exports",
      severity: missingGeneratedExports.length === 0 ? "pass" : "fail",
      detail:
        missingGeneratedExports.length === 0
          ? undefined
          : `Missing generated exports: ${missingGeneratedExports.join(", ")}`,
    });
  }

  const generatedImportViolations = listFiles(".", (path) =>
    isTsFile(path),
  ).filter((path) => {
    if (path === generatedSchemaPath) return false;
    if (path === "scripts/generate-auth-schema.ts") return false;
    if (path.startsWith("tests/")) return false;
    return /from\s+["'][^"']*auth-schema\.generated["']/.test(read(path));
  });
  addBoundaryCheck(
    "Auth schema: generated source is not imported by app code",
    generatedImportViolations,
  );
}

function checkDbGuardScripts() {
  checkFileExists("scripts/assert-safe-db-env.ts");

  const scripts = getPackageScripts();
  const requiredGuardedScripts = [
    "db:generate",
    "db:migrate",
    "db:push",
    "db:check",
    "db:studio",
    "db:seed",
    "vercel:bootstrap",
    "vercel:pull-env",
  ];
  const missingGuards = requiredGuardedScripts.filter(
    (scriptName) =>
      !scripts[scriptName]?.includes("scripts/assert-safe-db-env.ts"),
  );
  add({
    name: "DB guard: package scripts are guarded",
    severity: missingGuards.length === 0 ? "pass" : "fail",
    detail:
      missingGuards.length === 0
        ? undefined
        : `Missing guard in: ${missingGuards.join(", ")}`,
  });

  const schemaCreationScripts = ["db:migrate", "db:push"];
  const missingSchemaCreation = schemaCreationScripts.filter(
    (scriptName) => !scripts[scriptName]?.includes("--ensure-schema"),
  );
  add({
    name: "DB guard: schema creation before migration/push",
    severity: missingSchemaCreation.length === 0 ? "pass" : "fail",
    detail:
      missingSchemaCreation.length === 0
        ? undefined
        : `Missing --ensure-schema in: ${missingSchemaCreation.join(", ")}`,
  });

  add({
    name: "DB guard: pull-env production is guarded",
    severity:
      scripts["vercel:pull-env"]?.includes("pull-env") &&
      scripts["vercel:pull-env"]?.includes("--pull-environment=production")
        ? "pass"
        : "fail",
    detail:
      scripts["vercel:pull-env"]?.includes("pull-env") &&
      scripts["vercel:pull-env"]?.includes("--pull-environment=production")
        ? undefined
        : "vercel:pull-env must run assert-safe-db-env.ts pull-env --pull-environment=production first.",
  });
}

function checkApplicationSchemasUseAppSchema() {
  const schemaFiles = listFiles("src/features", (path) =>
    path.endsWith("/schema.ts"),
  );

  const pgTableViolations = schemaFiles.filter((path) =>
    /\bpgTable\s*(?:,|\(|\})/.test(read(path)),
  );
  addBoundaryCheck(
    "DB schema: feature tables use appSchema.table",
    pgTableViolations,
  );

  const pgEnumViolations = schemaFiles.filter((path) =>
    /\bpgEnum\s*(?:,|\(|\})/.test(read(path)),
  );
  addBoundaryCheck(
    "DB schema: feature enums use appSchema.enum",
    pgEnumViolations,
  );
}

function checkMigrationBaseline() {
  const migrationFiles = listFiles("src/lib/db/migrations", (path) =>
    path.endsWith(".sql"),
  );

  if (migrationFiles.length === 0) {
    add({
      name: "Database migrations",
      severity: "pass",
      detail:
        "No committed SQL baseline. Expected for the generic boilerplate; generate after init-project.",
    });
    return;
  }

  const publicSchemaViolations = migrationFiles.filter((path) => {
    const content = read(path);
    return (
      /CREATE\s+TYPE\s+"public"\./i.test(content) ||
      /CREATE\s+TABLE\s+"public"\./i.test(content) ||
      /REFERENCES\s+"public"\./i.test(content)
    );
  });
  addBoundaryCheck(
    "Database migrations: no public schema ownership",
    publicSchemaViolations,
  );

  const unqualifiedTableViolations = migrationFiles.filter((path) =>
    /CREATE\s+TABLE\s+"[^".]+"\s*\(/i.test(read(path)),
  );
  addBoundaryCheck(
    "Database migrations: tables are schema-qualified",
    unqualifiedTableViolations,
  );
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
    "APP_ENV",
    "CLIENT_SLUG",
    "PROJECT_SLUG",
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

  checkMigrationBaseline();

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

  checkArchitectureBoundaries();
  checkAuthSchemaIsolation();
  checkDbGuardScripts();
  checkApplicationSchemasUseAppSchema();
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
