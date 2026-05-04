import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

type Answers = {
  name: string;
  slug: string;
  description: string;
  appUrl: string;
  databaseUrl: string;
  remoteUrl: string;
  updateRemote: boolean;
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

function getArg(key: string): string {
  const value = args.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function projectNameFromRemote(remoteUrl: string): string {
  if (!remoteUrl) return "";
  const withoutGit = remoteUrl.replace(/\.git$/, "");
  return basename(withoutGit.replace(/:/g, "/"));
}

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function write(path: string, content: string) {
  writeFileSync(path, content);
}

function replaceFirstHeading(markdown: string, heading: string): string {
  if (/^# .+$/m.test(markdown)) {
    return markdown.replace(/^# .+$/m, `# ${heading}`);
  }
  return `# ${heading}\n\n${markdown}`;
}

function updatePackageJson(slug: string) {
  const path = "package.json";
  if (!existsSync(path)) return "skipped package.json missing";

  const packageJson = JSON.parse(read(path)) as { name?: string };
  packageJson.name = slug;
  write(`${path}`, `${JSON.stringify(packageJson, null, 2)}\n`);
  return "updated package.json name";
}

function updateReadme(answers: Answers) {
  const path = "README.md";
  if (!existsSync(path)) return "skipped README.md missing";

  let content = replaceFirstHeading(read(path), answers.name);
  content = content.replace(
    "Production-ready Next.js fullstack starter — prêt à cloner et démarrer un projet client.",
    answers.description,
  );
  content = content.replace(
    "### 4. Initialiser le projet via l'agent\n\n```\npnpm init-project\n```\n\nConfigure le nom du projet, l'URL du dépôt distant, et adapte les métadonnées du boilerplate.",
    "### 4. Initialiser le projet\n\n```bash\npnpm init-project\n```\n\nConfigure le nom du projet, l'URL publique, le dépôt distant optionnel, et adapte les métadonnées du boilerplate.",
  );
  write(path, content);
  return "updated README title and description";
}

function updateLayout(answers: Answers) {
  const path = "src/app/layout.tsx";
  if (!existsSync(path)) return "skipped src/app/layout.tsx missing";

  let content = read(path);
  content = content.replace(/default:\s*"[^"]*"/, `default: "${answers.name}"`);
  content = content.replace(
    /template:\s*"[^"]*"/,
    `template: "%s · ${answers.name}"`,
  );
  content = content.replace(
    /description:\s*"[^"]*"/,
    `description: "${answers.description.replace(/"/g, '\\"')}"`,
  );
  write(path, content);
  return "updated app metadata";
}

function updateEnvExample(answers: Answers) {
  const path = ".env.example";
  if (!existsSync(path)) return "skipped .env.example missing";
  if (!answers.appUrl) return "skipped .env.example URL defaults";

  let content = read(path);
  content = content.replace(
    /^BETTER_AUTH_URL=.*$/m,
    `BETTER_AUTH_URL=${answers.appUrl}`,
  );
  content = content.replace(
    /^NEXT_PUBLIC_APP_URL=.*$/m,
    `NEXT_PUBLIC_APP_URL=${answers.appUrl}`,
  );
  write(path, content);
  return "updated .env.example app URLs";
}

function updateEnvLocal(answers: Answers) {
  const path = ".env.local";
  const existed = existsSync(path);
  const base = existsSync(path)
    ? read(path)
    : existsSync(".env.example")
      ? read(".env.example")
      : "";
  if (!base) return "skipped .env.local missing .env.example";

  let content = base;
  content = upsertEnv(content, "DATABASE_URL", answers.databaseUrl);
  content = upsertEnv(
    content,
    "BETTER_AUTH_SECRET",
    getExistingEnvValue(content, "BETTER_AUTH_SECRET") ||
      randomBytes(32).toString("base64"),
  );
  content = upsertEnv(content, "BETTER_AUTH_URL", answers.appUrl);
  content = upsertEnv(content, "NEXT_PUBLIC_APP_URL", answers.appUrl);
  write(path, content.endsWith("\n") ? content : `${content}\n`);
  return existed ? "updated .env.local" : "created .env.local";
}

function getExistingEnvValue(content: string, key: string) {
  return content.match(new RegExp(`^${key}=(.*)$`, "m"))?.[1]?.trim() ?? "";
}

function upsertEnv(content: string, key: string, value: string) {
  if (!value && content.match(new RegExp(`^${key}=`, "m"))) return content;
  const line = `${key}=${value}`;
  if (content.match(new RegExp(`^${key}=`, "m"))) {
    return content.replace(new RegExp(`^${key}=.*$`, "m"), line);
  }
  return `${content.replace(/\s*$/, "\n")}${line}\n`;
}

function updateAgentContext(answers: Answers) {
  const path = "AGENT.md";
  if (!existsSync(path)) return "skipped AGENT.md missing";

  const content = read(path);
  const replacement = `## Projet\n\n${answers.name} est un projet issu du boilerplate NecaTech.\n\nObjectif: ${answers.description}\n`;
  const updated = content.replace(
    /## Detection Boilerplate[\s\S]*?(?=\n## Renvois)/,
    replacement,
  );
  write(path, updated);
  return "updated root AGENT.md project context";
}

function updateRemote(answers: Answers) {
  if (!answers.updateRemote || !answers.remoteUrl) return "skipped git remote";

  const hasOrigin =
    spawnSync("git", ["remote", "get-url", "origin"], {
      encoding: "utf8",
      stdio: "pipe",
    }).status === 0;
  const command = hasOrigin
    ? ["remote", "set-url", "origin", answers.remoteUrl]
    : ["remote", "add", "origin", answers.remoteUrl];
  const result = spawnSync("git", command, { encoding: "utf8", stdio: "pipe" });
  if (result.status !== 0) {
    return `failed git remote: ${(result.stderr || result.stdout).trim()}`;
  }
  return hasOrigin ? "updated git origin remote" : "added git origin remote";
}

function formatTouchedFiles() {
  const result = spawnSync(
    "pnpm",
    [
      "exec",
      "prettier",
      "--write",
      "package.json",
      "README.md",
      "AGENT.md",
      ".env.example",
      "src/app/layout.tsx",
    ],
    { encoding: "utf8", stdio: "pipe" },
  );
  return result.status === 0
    ? "formatted initialized files"
    : "skipped formatting initialized files";
}

async function promptAnswers(): Promise<Answers> {
  const remoteFromArg = getArg("remote") || getArg("git-url");
  const nameFromRemote = titleFromSlug(projectNameFromRemote(remoteFromArg));
  const nameDefault = getArg("name") || nameFromRemote || "Nouveau Projet";
  const slugDefault = getArg("slug") || slugify(nameDefault);
  const descriptionDefault =
    getArg("description") ||
    "Application web construite avec le boilerplate NecaTech.";
  const appUrlDefault = getArg("url") || "http://localhost:3000";
  const databaseUrlDefault = getArg("database-url");

  if (args.has("yes")) {
    return {
      name: nameDefault,
      slug: slugDefault,
      description: descriptionDefault,
      appUrl: appUrlDefault,
      databaseUrl: databaseUrlDefault,
      remoteUrl: remoteFromArg,
      updateRemote: Boolean(remoteFromArg),
    };
  }

  const rl = createInterface({ input, output });
  try {
    const name =
      (await rl.question(`Nom du projet (${nameDefault}) `)).trim() ||
      nameDefault;
    const slug =
      (
        await rl.question(`Slug package (${slugify(name) || slugDefault}) `)
      ).trim() ||
      slugify(name) ||
      slugDefault;
    const description =
      (
        await rl.question(`Description courte (${descriptionDefault}) `)
      ).trim() || descriptionDefault;
    const appUrl =
      (await rl.question(`URL publique/dev (${appUrlDefault}) `)).trim() ||
      appUrlDefault;
    const databaseUrl =
      (
        await rl.question(
          `DATABASE_URL Neon, optionnel (${databaseUrlDefault || "à remplir plus tard"}) `,
        )
      ).trim() || databaseUrlDefault;
    const remoteUrl =
      (
        await rl.question(
          `Git remote origin, optionnel (${remoteFromArg || "aucun"}) `,
        )
      ).trim() || remoteFromArg;
    const updateRemoteAnswer = remoteUrl
      ? (await rl.question("Mettre à jour git origin ? (y/N) ")).trim()
      : "";

    return {
      name,
      slug,
      description,
      appUrl,
      databaseUrl,
      remoteUrl,
      updateRemote: /^y(es)?$/i.test(updateRemoteAnswer),
    };
  } finally {
    rl.close();
  }
}

async function main() {
  const answers = await promptAnswers();
  if (!answers.name || !answers.slug) {
    console.error("Project name and slug are required.");
    process.exit(1);
  }

  const actions = [
    updatePackageJson(answers.slug),
    updateReadme(answers),
    updateLayout(answers),
    updateEnvExample(answers),
    updateEnvLocal(answers),
    updateAgentContext(answers),
    updateRemote(answers),
    formatTouchedFiles(),
  ];

  console.log("\nProject initialized\n");
  for (const action of actions) console.log(`- ${action}`);
  console.log("\nNext steps:");
  console.log("- fill DATABASE_URL in .env.local if it is still empty");
  console.log("- pnpm db:migrate");
  console.log("- pnpm readiness:static");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
