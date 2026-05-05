import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

type BootstrapOptions = {
  project: string;
  team: string;
  token: string;
  deploy: boolean;
  pullEnv: boolean;
  pullEnvironment: string;
  productionOnly: boolean;
  appUrl: string;
};

const args = new Map<string, string | boolean>();
for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index];
  if (!arg?.startsWith("--")) continue;

  const [rawKey, rawValue] = arg.slice(2).split("=", 2);
  if (!rawKey) continue;

  if (rawValue !== undefined) {
    args.set(rawKey, rawValue);
    continue;
  }

  const next = process.argv[index + 1];
  if (next && !next.startsWith("--")) {
    args.set(rawKey, next);
    index += 1;
  } else {
    args.set(rawKey, true);
  }
}

function getArg(key: string) {
  const value = args.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function hasFlag(key: string) {
  return args.get(key) === true;
}

function readEnvFile(path: string) {
  if (!existsSync(path)) return new Map<string, string>();

  const env = new Map<string, string>();
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const key = match[1];
    const rawValue = match[2];
    if (!key || rawValue === undefined) continue;

    const value = rawValue
      .trim()
      .replace(/^(['"])(.*)\1$/, "$2")
      .trim();
    env.set(key, value);
  }
  return env;
}

function upsertEnvFile(path: string, key: string, value: string) {
  const content = existsSync(path) ? readFileSync(path, "utf8") : "";
  const line = `${key}=${value}`;
  const updated = content.match(new RegExp(`^${key}=`, "m"))
    ? content.replace(new RegExp(`^${key}=.*$`, "m"), line)
    : `${content.replace(/\s*$/, "\n")}${line}\n`;
  writeFileSync(path, updated.endsWith("\n") ? updated : `${updated}\n`);
}

function vercelEnv() {
  const cacheDir = join(process.cwd(), ".vercel-cache");
  mkdirSync(cacheDir, { recursive: true });
  return {
    ...process.env,
    XDG_CACHE_HOME: cacheDir,
  };
}

function runVercel(
  args: string[],
  options?: { input?: string; quiet?: boolean },
) {
  const result = spawnSync("vercel", args, {
    encoding: "utf8",
    env: vercelEnv(),
    input: options?.input,
    stdio: options?.quiet ? "pipe" : "inherit",
  });

  if (result.status !== 0) {
    const message = [result.stderr, result.stdout].filter(Boolean).join("\n");
    throw new Error(message.trim() || `vercel ${args.join(" ")} failed`);
  }

  return result;
}

function assertVercelCli() {
  const result = spawnSync("vercel", ["--version"], {
    encoding: "utf8",
    env: vercelEnv(),
    stdio: "pipe",
  });

  if (result.status !== 0) {
    throw new Error(
      "Vercel CLI is required. Install it with `pnpm add -g vercel` or `npm i -g vercel`.",
    );
  }
}

function assertLoggedIn(token: string) {
  const command = token ? ["whoami", "--token", token] : ["whoami"];
  const result = spawnSync("vercel", command, {
    encoding: "utf8",
    env: vercelEnv(),
    stdio: "pipe",
  });

  if (result.status !== 0) {
    throw new Error(
      token
        ? "The provided VERCEL_TOKEN/--token was rejected by Vercel."
        : "Vercel CLI is not logged in. Run `vercel login`, or pass `--token <token>` / VERCEL_TOKEN.",
    );
  }
}

async function promptOptions(): Promise<BootstrapOptions> {
  const defaultProject = getArg("project");
  const defaultTeam = getArg("team") || process.env.VERCEL_TEAM || "";
  const defaultToken = getArg("token") || process.env.VERCEL_TOKEN || "";
  const defaultAppUrl = getArg("app-url") || "";

  if (hasFlag("yes")) {
    return {
      project: defaultProject,
      team: defaultTeam,
      token: defaultToken,
      deploy: !hasFlag("no-deploy"),
      pullEnv: hasFlag("pull-env"),
      pullEnvironment: getArg("pull-environment") || "production",
      productionOnly: hasFlag("production-only"),
      appUrl: defaultAppUrl,
    };
  }

  const rl = createInterface({ input, output });
  try {
    const project =
      (
        await rl.question(
          `Projet Vercel existant, optionnel (${defaultProject || "auto"}) `,
        )
      ).trim() || defaultProject;
    const team =
      (
        await rl.question(
          `Team/scope Vercel, optionnel (${defaultTeam || "compte courant"}) `,
        )
      ).trim() || defaultTeam;
    const appUrl =
      (
        await rl.question(
          `URL publique custom, optionnel (${defaultAppUrl || "fallback variables système Vercel"}) `,
        )
      ).trim() || defaultAppUrl;
    const deployAnswer =
      (
        await rl.question("Déployer en production après configuration ? (Y/n) ")
      ).trim() || "y";

    return {
      project,
      team,
      token: defaultToken,
      deploy: !/^n(o)?$/i.test(deployAnswer),
      pullEnv: hasFlag("pull-env"),
      pullEnvironment: getArg("pull-environment") || "production",
      productionOnly: hasFlag("production-only"),
      appUrl,
    };
  } finally {
    rl.close();
  }
}

function vercelBaseArgs(options: BootstrapOptions) {
  return [
    ...(options.team ? ["--scope", options.team] : []),
    ...(options.token ? ["--token", options.token] : []),
  ];
}

function linkProject(options: BootstrapOptions) {
  const linkArgs = [
    "link",
    "--yes",
    ...vercelBaseArgs(options),
    ...(options.project ? ["--project", options.project] : []),
  ];
  runVercel(linkArgs);
}

function addEnv(
  name: string,
  value: string,
  target: string,
  options: BootstrapOptions,
) {
  if (!value)
    throw new Error(`${name} is empty; refusing to push an empty secret.`);

  runVercel(
    [
      "env",
      "add",
      name,
      target,
      "--force",
      "--yes",
      ...vercelBaseArgs(options),
    ],
    { input: value, quiet: true },
  );
  console.log(`- ${name} configured for ${target}`);
}

function pullEnvFile(options: BootstrapOptions) {
  runVercel([
    "env",
    "pull",
    ".env.local",
    "--environment",
    options.pullEnvironment,
    "--yes",
    ...vercelBaseArgs(options),
  ]);
}

async function main() {
  const options = await promptOptions();
  const envPath = ".env.local";
  const localEnv = readEnvFile(envPath);

  assertVercelCli();
  assertLoggedIn(options.token);

  if (options.pullEnv) {
    console.log("\nLinking Vercel project");
    linkProject(options);
    console.log(
      `\nPulling ${options.pullEnvironment} environment to .env.local`,
    );
    pullEnvFile(options);
    return;
  }

  const databaseUrl = localEnv.get("DATABASE_URL") ?? "";
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is missing from .env.local. Create the Neon database first, then rerun this script.",
    );
  }

  let betterAuthSecret = localEnv.get("BETTER_AUTH_SECRET") ?? "";
  if (!betterAuthSecret) {
    betterAuthSecret = randomBytes(32).toString("base64");
    upsertEnvFile(envPath, "BETTER_AUTH_SECRET", betterAuthSecret);
    console.log("- generated BETTER_AUTH_SECRET in .env.local");
  }

  const appUrl =
    options.appUrl ||
    localEnv.get("BETTER_AUTH_URL")?.replace(/^http:\/\/localhost:\d+$/, "") ||
    localEnv
      .get("NEXT_PUBLIC_APP_URL")
      ?.replace(/^http:\/\/localhost:\d+$/, "") ||
    "";

  console.log("\nLinking Vercel project");
  linkProject(options);

  const targets = options.productionOnly
    ? ["production"]
    : ["production", "preview", "development"];

  console.log("\nConfiguring Vercel environment variables");
  for (const target of targets) {
    addEnv("DATABASE_URL", databaseUrl, target, options);
    addEnv("BETTER_AUTH_SECRET", betterAuthSecret, target, options);

    if (appUrl) {
      addEnv("BETTER_AUTH_URL", appUrl, target, options);
      addEnv("NEXT_PUBLIC_APP_URL", appUrl, target, options);
    }
  }

  if (!appUrl) {
    console.log(
      "- app URL variables skipped; build will use Vercel system variables. Ensure they are exposed in Vercel Project Settings.",
    );
  }

  if (!options.deploy) {
    console.log(
      "\nVercel is configured. Deploy later with `vercel deploy --prod`.",
    );
    return;
  }

  console.log("\nDeploying production");
  runVercel(["deploy", "--prod", "--yes", ...vercelBaseArgs(options)]);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
