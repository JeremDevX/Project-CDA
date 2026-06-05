import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";
import { Buffer } from "buffer";

const password = "JohnDoe123";
const apiBaseUrl = "http://localhost:1338/api";
// Image minimale embarquée pour garder le test indépendant du système de fichiers.
const testImageBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";

type Person = {
  fullName: string;
  email: string;
  phone: string;
  relation?: string;
};

function buildRunId(testInfo: { workerIndex: number }) {
  // Identifiant unique pour éviter les collisions de comptes entre exécutions parallèles.
  return `${Date.now()}-${testInfo.workerIndex}`;
}

async function cleanupE2eUser(request: APIRequestContext, email: string) {
  const response = await request.delete(`${apiBaseUrl}/e2e/users`, {
    data: { email },
  });

  expect(response.ok()).toBeTruthy();

  return (await response.json()) as {
    deletedUsers: number;
    deletedStorageObjects: number;
  };
}

async function registerUser(page: Page, runId: string, email: string) {
  await page.goto("/");
  await page.getByTestId("nav-register").click();

  await page.getByTestId("register-username").fill(`Utilisateur E2E ${runId}`);
  await page.getByTestId("register-email").fill(email);
  await page.getByTestId("register-password").fill(password);
  await page.getByTestId("register-confirm-password").fill(password);
  await page.getByTestId("register-submit").click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

async function uploadTestImage(page: Page) {
  const fileChooserPromise = page.waitForEvent("filechooser");

  await page.getByTestId("gift-media-upload-button").click();

  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: "gift-e2e.png",
    mimeType: "image/png",
    buffer: Buffer.from(testImageBase64, "base64"),
  });

  await expect(page.getByText("gift-e2e.png")).toBeVisible();
}

async function fillRecipient(page: Page, recipient: Person) {
  await page.getByTestId("recipient-full-name").fill(recipient.fullName);
  await page.getByTestId("recipient-email").fill(recipient.email);
  await page.getByTestId("recipient-phone").fill(recipient.phone);
  await page.getByTestId("recipient-add").click();

  await expect(page.getByText(recipient.email)).toBeVisible();
}

async function fillTrustedThird(page: Page, trustedThird: Person) {
  await page.getByTestId("trusted-third-full-name").fill(trustedThird.fullName);
  await page.getByTestId("trusted-third-email").fill(trustedThird.email);
  await page
    .getByTestId("trusted-third-relation")
    .fill(trustedThird.relation ?? "");
  await page.getByTestId("trusted-third-phone").fill(trustedThird.phone);
  await page.getByTestId("trusted-third-add").click();

  await expect(page.getByText(trustedThird.email)).toBeVisible();
}

async function acceptConfirmation(page: Page, testId: string) {
  await page.getByTestId(testId).click();
}

test.describe("gift creation tunnel", () => {
  test("creates an account, a gift, then validates it", async ({
    page,
    request,
  }, testInfo) => {
    test.setTimeout(120_000);

    // Données métiers isolées par run, supprimées en fin de test via l'endpoint e2e.
    const runId = buildRunId(testInfo);
    const userEmail = `legacygift.e2e.${runId}@example.test`;
    const giftTitle = `Gift E2E ${runId}`;
    let isUserRegistered = false;
    let isMediaUploaded = false;
    const recipient = {
      fullName: "Destinataire E2E",
      email: `recipient.${runId}@example.test`,
      phone: "0102030405",
    };
    const trustedThirds = [1, 2, 3].map((index) => ({
      fullName: `Tiers E2E ${index}`,
      email: `trusted-${index}.${runId}@example.test`,
      phone: `010203040${index}`,
      relation: `Relation ${index}`,
    }));

    try {
      await registerUser(page, runId, userEmail);
      isUserRegistered = true;

      // Création du gift : offre, mode de rédaction, contenu et média.
      await page.getByTestId("gift-create-first").click();
      await expect(page).toHaveURL(/\/gifts\/\d+\/pricing$/);
      await page.waitForLoadState("networkidle");

      await page.getByTestId("offer-plan-standard").click();
      await expect(page.getByTestId("gift-pricing-next")).toBeEnabled();
      await page.getByTestId("gift-pricing-next").click();
      await expect(page).toHaveURL(/\/gifts\/\d+\/creation-mode$/);
      await page.waitForLoadState("networkidle");

      await page.getByTestId("creation-mode-free").click();
      await page.getByTestId("gift-creation-mode-next").click();
      await expect(page).toHaveURL(/\/gifts\/\d+\/composition$/);
      await page.waitForLoadState("networkidle");

      const titleInput = page.getByTestId("gift-title-input");
      await expect(titleInput).toBeEnabled();
      await expect(titleInput).toHaveValue("Nouveau gift");
      await titleInput.click();
      await page.keyboard.press("Meta+A");
      await page.keyboard.type(giftTitle);
      await expect(titleInput).toHaveValue(giftTitle);
      const messageEditor = page
        .getByTestId("gift-message-editor")
        .locator(".ProseMirror");
      await messageEditor.click();
      await page.keyboard.type("Corps du gift E2E.");
      await expect(messageEditor).toContainText("Corps du gift E2E.");
      await expect(page.getByTestId("gift-composition-next")).toBeEnabled();
      await page.getByTestId("gift-composition-next").click();
      await expect(page).toHaveURL(/\/gifts\/\d+\/images$/);
      await page.waitForLoadState("networkidle");

      await uploadTestImage(page);
      isMediaUploaded = true;
      await page.getByTestId("gift-media-next").click();
      await expect(page).toHaveURL(/\/gifts\/\d+\/preview$/);
      await page.waitForLoadState("networkidle");
      await expect(page.getByRole("heading", { name: giftTitle })).toBeVisible();

      // Validation métier : destinataire, trois tiers de confiance et confirmations obligatoires.
      await page.getByTestId("gift-preview-next").click();
      await expect(page).toHaveURL(/\/gifts\/\d+\/recipients$/);
      await page.waitForLoadState("networkidle");
      await fillRecipient(page, recipient);
      await page.getByTestId("gift-recipients-next").click();

      await expect(page).toHaveURL(/\/gifts\/\d+\/trusted-thirds$/);
      await page.waitForLoadState("networkidle");
      for (const trustedThird of trustedThirds) {
        await fillTrustedThird(page, trustedThird);
      }
      await expect(page.getByText("3 / 3")).toBeVisible();
      await page.getByTestId("gift-trusted-thirds-next").click();

      await expect(page).toHaveURL(/\/gifts\/\d+\/confirmations$/);
      await page.waitForLoadState("networkidle");
      await acceptConfirmation(page, "confirmation-respectAndKindnessConfirmed");
      await acceptConfirmation(page, "confirmation-contactDetailsConfirmed");
      await acceptConfirmation(page, "confirmation-activationConfirmed");
      await page.getByTestId("gift-confirmations-next").click();

      await expect(page).toHaveURL(/\/gifts\/\d+\/summary$/);
      await page.waitForLoadState("networkidle");
      await expect(page.getByText(recipient.email)).toBeVisible();
      await expect(page.getByText("Tiers E2E 1")).toBeVisible();

      // Paiement hébergé : carte de test puis contrôle de la page d'activation et du justificatif.
      await page.getByTestId("gift-payment-start").click();
      await page.getByRole("radio", { name: "Card" }).click({ force: true });
      await page
        .getByRole("textbox", { name: /Numéro de carte|Card number/ })
        .fill("4242 4242 4242 4242");
      await page
        .getByRole("textbox", { name: /Date d'expiration|Expiration/ })
        .fill("04 / 29");
      await page
        .getByRole("textbox", { name: /Code de sécurité|Security code|CVC/ })
        .fill("424");
      await page
        .getByRole("textbox", {
          name: /Nom du titulaire de la carte|Cardholder name/,
        })
        .fill("Utilisateur E2E");
      await page.getByTestId("hosted-payment-submit-button").click();

      await expect(page).toHaveURL(/\/gifts\/\d+\/activated/, {
        timeout: 30_000,
      });
      await expect(
        page.getByRole("heading", {
          name: "Félicitations, votre Gift est prêt pour le futur",
        }),
      ).toBeVisible();
      await expect(page.getByTestId("payment-confirmation-pdf")).toBeVisible();

      const downloadPromise = page.waitForEvent("download");
      await page.getByTestId("payment-confirmation-pdf").click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toMatch(/^confirmation-paiement-/);
    } finally {
      const cleanup = await cleanupE2eUser(request, userEmail);

      if (isUserRegistered) {
        expect(cleanup.deletedUsers).toBe(1);
      }

      if (isMediaUploaded) {
        expect(cleanup.deletedStorageObjects).toBe(1);
      }
    }
  });
});
