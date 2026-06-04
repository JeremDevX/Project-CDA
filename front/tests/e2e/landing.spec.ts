import { expect, test } from "@playwright/test";

test.describe("landing page", () => {
  test("displays the main content", async ({ page }) => {
    // La landing est publique : ce test sécurise les contenus clés visibles sans authentification.
    await page.goto("/");

    await expect(page.getByTestId("landing-hero-title")).toBeVisible();
    await expect(page.getByTestId("landing-create-message-link")).toBeVisible();
    await expect(page.getByTestId("landing-pricing-title")).toBeVisible();
  });

  test("updates the preview when a step is selected", async ({ page }) => {
    // Vérifie l'unique interaction dynamique de la page marketing.
    await page.goto("/");

    await page.getByTestId("landing-step-2").click();

    await expect(
      page.getByTestId("landing-step-preview-detail"),
    ).toContainText("Choisissez les destinataires qui recevront vos messages.");
  });
});
