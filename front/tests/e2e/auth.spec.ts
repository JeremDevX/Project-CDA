import { expect, test } from "@playwright/test";

test.describe("auth page", () => {
  test("displays the auth tabs and register form", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("button", { name: "Connexion" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Inscription" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Inscription" }).click();

    await expect(page.getByLabel("Nom d'utilisateur", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Mot de passe", { exact: true })).toBeVisible();
    await expect(
      page.getByLabel("Confirmer le mot de passe", { exact: true }),
    ).toBeVisible();
  });
});
