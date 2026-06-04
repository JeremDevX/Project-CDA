import { expect, test } from "@playwright/test";

test.describe("auth page", () => {
  test("displays the auth tabs and register form", async ({ page }) => {
    // Smoke test volontairement court : il valide l'accès au formulaire sans lancer un parcours complet.
    await page.goto("/login");

    await expect(page.getByTestId("auth-login-tab")).toBeVisible();
    await expect(page.getByTestId("auth-register-tab")).toBeVisible();

    await page.getByTestId("auth-register-tab").click();

    await expect(page.getByTestId("register-username")).toBeVisible();
    await expect(page.getByTestId("register-email")).toBeVisible();
    await expect(page.getByTestId("register-password")).toBeVisible();
    await expect(page.getByTestId("register-confirm-password")).toBeVisible();
  });
});
