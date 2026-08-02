import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { parse } from "dotenv";

const envFile = resolve(process.cwd(), ".env.local");

function loadLocalEnv() {
  if (!existsSync(envFile)) {
    throw new Error(
      "Missing .env.local. Create it before verifying local auth.",
    );
  }

  return parse(readFileSync(envFile));
}

function requiredEnv(env: Record<string, string>, name: string) {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing ${name} in .env.local.`);
  }
  return value;
}

async function main() {
  const localEnv = loadLocalEnv();
  const appEnv = requiredEnv(localEnv, "APP_ENV");
  const localAuthEnabled = requiredEnv(localEnv, "LOCAL_AUTH_ENABLED");
  const founderEmail = requiredEnv(localEnv, "FOUNDER_EMAIL");
  const founderPassword = requiredEnv(localEnv, "FOUNDER_INITIAL_PASSWORD");
  const baseUrl =
    process.env.DASHBOARD_URL ??
    localEnv.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  if (appEnv !== "dev" || localAuthEnabled !== "true") {
    throw new Error(
      "Local dashboard verification requires APP_ENV=dev and LOCAL_AUTH_ENABLED=true.",
    );
  }

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
    });
    await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
    await page.getByLabel("Email").fill(founderEmail);
    await page.getByLabel("Mot de passe").fill(founderPassword);
    await page.getByRole("button", { name: /se connecter/i }).click();

    await page.waitForURL("**/dashboard", { timeout: 10_000 });
    await page
      .getByRole("heading", { name: "Vue d'ensemble du socle" })
      .waitFor({ timeout: 10_000 });
    await page.getByRole("button", { name: "Admin" }).click();
    await page
      .getByRole("heading", { name: "Vue admin" })
      .waitFor({ timeout: 10_000 });
    await page.goto(`${baseUrl}/administration`, {
      waitUntil: "networkidle",
    });
    await page
      .getByRole("heading", { name: "Créer un admin" })
      .waitFor({ timeout: 10_000 });
    await page
      .getByText("disponible uniquement en phase staging")
      .waitFor({ timeout: 10_000 });

    console.log(
      JSON.stringify({
        ok: true,
        url: `${baseUrl}/dashboard`,
        login: true,
        viewSwitch: true,
        administrationFounderAction: true,
      }),
    );
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Dashboard local verification failed: ${message}`);
  process.exit(1);
});
