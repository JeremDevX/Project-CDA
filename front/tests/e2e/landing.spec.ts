import { expect, test } from "@playwright/test";

test.describe("landing page", () => {
  test("displays the main content", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: "Vos derniers mots, au moment où ils comptent le plus.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Créer mon premier message" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Tarification" }),
    ).toBeVisible();
  });

  test("updates the preview when a step is selected", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /Étape 2.*Choisir les destinataires/ }).click();

    await expect(
      page.getByText("Choisissez les destinataires qui recevront vos messages."),
    ).toBeVisible();
  });
});
