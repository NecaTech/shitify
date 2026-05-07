import { expect, test } from "@playwright/test";

test("login page exposes the email/password form", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Mot de passe")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Se connecter" }),
  ).toBeVisible();
});

test("register page exposes the account creation form", async ({ page }) => {
  await page.goto("/register");

  await expect(
    page.getByRole("heading", { name: "Créer un compte" }),
  ).toBeVisible();
  await expect(page.getByLabel("Nom")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Mot de passe")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Créer un compte" }),
  ).toBeVisible();
});

test("protected dashboard redirects anonymous users to login", async ({
  page,
}) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard$/);
  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
});
