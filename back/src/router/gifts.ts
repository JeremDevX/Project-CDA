import { Router } from "express";
import Stripe from "stripe";
import { config } from "../config";
import { prisma } from "../database";
import { normalizeTextInput } from "../helpers/validation";
import { nextCheckInDueFrom } from "../jobs/checkInReminders";
import sanitizeHtml from "sanitize-html";

export const giftsRouter = Router();

const MAX_GIFT_TITLE_LENGTH = 250;
const MAX_GIFT_MESSAGE_LENGTH = 25000;
const allowedOffers = ["essentiel", "standard", "premium"] as const;
type AllowedOffer = (typeof allowedOffers)[number];
const allowedCreationModes = ["free"] as const;
const allowedEditionSteps = [
  "creation-mode",
  "composition",
  "images",
  "preview",
  "recipients",
  "trusted-thirds",
  "confirmations",
  "summary",
] as const;
const DRAFT_EXPIRATION_DAYS = 30;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const offerPrices = {
  essentiel: {
    name: "Gift Essentiel",
    amount: 1900,
  },
  standard: {
    name: "Gift Standard",
    amount: 3900,
  },
  premium: {
    name: "Gift Premium",
    amount: 4900,
  },
} as const;

function formatAmount(amountCents: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

function formatDateFr(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatReferenceDate(date: Date) {
  return [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    date.getFullYear(),
  ].join("-");
}

function buildPaymentReference(username: string, giftId: number, paidAt: Date) {
  const initial = username.trim().charAt(0).toUpperCase() || "U";

  return `GIFT-${initial}-${giftId}-${formatReferenceDate(paidAt)}`;
}

function getStripePaymentIntentId(session: {
  payment_intent?: string | { id: string } | null;
}) {
  if (!session.payment_intent) {
    return null;
  }

  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent.id;
}

function normalizePdfText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "");
}

function escapePdfText(value: string) {
  return normalizePdfText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function createPaymentConfirmationPdf(lines: string[]) {
  let currentY = 790;
  const contentLines = lines.map((line, index) => {
    const fontSize = index === 0 ? 18 : 11;
    const lineY = currentY;
    currentY -= index === 0 ? 32 : 18;

    return `/F1 ${fontSize} Tf 1 0 0 1 50 ${lineY} Tm (${escapePdfText(line)}) Tj`;
  });
  const stream = `BT\n${contentLines.join("\n")}\nET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "ascii");
}

function getStripeClient() {
  if (!config.stripeSecretKey) {
    return null;
  }

  return new Stripe(config.stripeSecretKey);
}

function isMissingStripeResourceError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    ((error as { code?: unknown }).code === "resource_missing" ||
      (error as { type?: unknown }).type === "StripeInvalidRequestError") &&
    (error as { code?: unknown; statusCode?: unknown }).statusCode === 404
  );
}

function normalizeStripeCheckoutSessionId(value: string) {
  return value.split("#")[0].split("?")[0];
}

function isAllowedOffer(value: unknown): value is AllowedOffer {
  return typeof value === "string" && allowedOffers.includes(value as never);
}

function isAllowedCreationMode(value: unknown) {
  return (
    typeof value === "string" && allowedCreationModes.includes(value as never)
  );
}

function isAllowedEditionStep(value: unknown) {
  return (
    typeof value === "string" && allowedEditionSteps.includes(value as never)
  );
}

function hasField(body: unknown, field: string) {
  return typeof body === "object" && body !== null && field in body;
}

function sanitizeGiftMessageHtml(value: string) {
  return sanitizeHtml(value, {
    allowedTags: [
      "p",
      "strong",
      "em",
      "b",
      "i",
      "ul",
      "ol",
      "li",
      "blockquote",
      "br",
    ],
    allowedAttributes: {},
  });
}

function draftExpirationDate(createdAt = new Date()) {
  return new Date(createdAt.getTime() + DRAFT_EXPIRATION_DAYS * DAY_IN_MS);
}

giftsRouter.post("/", async (req, res) => {
  try {
    const userId = req.authUser?.id;

    if (!userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const title = normalizeTextInput(req.body?.title || "Nouveau gift");
    const now = new Date();

    const gift = await prisma.gift.create({
      data: {
        title,
        status: "brouillon",
        createdAt: now,
        draftExpiresAt: draftExpirationDate(now),
        userId,
      },
    });

    return res.status(201).json({ gift });
  } catch (error) {
    console.error("Erreur lors de la création du gift:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

giftsRouter.get("/", async (req, res) => {
  try {
    const userId = req.authUser?.id;

    if (!userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const gifts = await prisma.gift.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        medias: {
          include: {
            mediaAsset: {
              select: { type: true },
            },
          },
        },
        recipients: {
          select: { id: true },
        },
      },
    });

    const giftsWithMediaCounts = gifts.map(
      ({ medias, recipients, ...gift }) => ({
        ...gift,
        imageCount: medias.filter(
          (media) => media.mediaAsset.type === "image",
        ).length,
        videoCount: medias.filter(
          (media) => media.mediaAsset.type === "video",
        ).length,
        recipientCount: recipients.length,
      }),
    );

    return res.json({ gifts: giftsWithMediaCounts });
  } catch (error) {
    console.error("Erreur lors de la récupération des gifts:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

giftsRouter.patch("/:giftId", async (req, res) => {
  try {
    const userId = req.authUser?.id;
    const giftId = Number(req.params.giftId);

    if (!userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    if (!Number.isInteger(giftId)) {
      return res.status(400).json({ message: "Gift invalide" });
    }

    const dataToUpdate: {
      offer?: string;
      creationMode?: string;
      lastEditionStep?: string;
      title?: string;
      message?: string;
    } = {};

    if (hasField(req.body, "offer")) {
      const offer = req.body.offer;

      if (!isAllowedOffer(offer)) {
        return res.status(400).json({ message: "Offre invalide" });
      }

      dataToUpdate.offer = offer;
    }

    if (hasField(req.body, "creationMode")) {
      const creationMode = req.body.creationMode;

      if (!isAllowedCreationMode(creationMode)) {
        return res.status(400).json({ message: "Mode de création invalide" });
      }

      dataToUpdate.creationMode = creationMode;
    }

    if (hasField(req.body, "lastEditionStep")) {
      const lastEditionStep = req.body.lastEditionStep;

      if (!isAllowedEditionStep(lastEditionStep)) {
        return res.status(400).json({ message: "Étape invalide" });
      }

      dataToUpdate.lastEditionStep = lastEditionStep;
    }

    if (hasField(req.body, "title")) {
      const title = normalizeTextInput(req.body.title);

      if (title.length > MAX_GIFT_TITLE_LENGTH) {
        return res.status(400).json({
          message: "Le titre est trop long. Merci de le raccourcir légèrement.",
        });
      }

      dataToUpdate.title = title;
    }

    if (hasField(req.body, "message")) {
      const message = sanitizeGiftMessageHtml(
        normalizeTextInput(req.body.message),
      );

      if (message.length > MAX_GIFT_MESSAGE_LENGTH) {
        return res.status(400).json({
          message:
            "Le message est trop long. Merci de le raccourcir légèrement.",
        });
      }

      dataToUpdate.message = message;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({
        message: "Aucune donnée à mettre à jour",
      });
    }

    const existingGift = await prisma.gift.findFirst({
      where: {
        id: giftId,
        userId,
      },
    });

    if (!existingGift) {
      return res.status(404).json({ message: "Gift introuvable" });
    }

    const gift = await prisma.gift.update({
      where: {
        id: giftId,
      },
      data: dataToUpdate,
    });

    return res.json({ gift });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du gift:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

giftsRouter.post("/:giftId/confirmations", async (req, res) => {
  try {
    const userId = req.authUser?.id;
    const giftId = Number(req.params.giftId);

    if (!userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    if (!Number.isInteger(giftId)) {
      return res.status(400).json({ message: "Gift invalide" });
    }

    if (req.body?.finalConfirmationsAccepted !== true) {
      return res.status(400).json({
        message: "Toutes les confirmations sont requises",
      });
    }

    const existingGift = await prisma.gift.findFirst({
      where: {
        id: giftId,
        userId,
      },
      include: {
        _count: {
          select: {
            recipients: true,
            trustedThirds: true,
          },
        },
      },
    });

    if (!existingGift) {
      return res.status(404).json({ message: "Gift introuvable" });
    }

    if (existingGift._count.recipients === 0) {
      return res.status(400).json({
        message: "Au moins un destinataire est requis",
      });
    }

    if (existingGift._count.trustedThirds !== 3) {
      return res.status(400).json({
        message: "Exactement 3 tiers de confiance sont requis",
      });
    }

    const gift = await prisma.gift.update({
      where: {
        id: giftId,
      },
      data: {
        finalConfirmationsAt: new Date(),
        lastEditionStep: "summary",
      },
    });

    return res.json({ gift });
  } catch (error) {
    console.error("Erreur lors de la confirmation du gift:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

giftsRouter.post("/:giftId/checkout-session", async (req, res) => {
  try {
    const userId = req.authUser?.id;
    const giftId = Number(req.params.giftId);
    const stripe = getStripeClient();

    if (!userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    if (!Number.isInteger(giftId)) {
      return res.status(400).json({ message: "Gift invalide" });
    }

    if (!stripe) {
      return res.status(500).json({ message: "Stripe n'est pas configuré" });
    }

    const gift = await prisma.gift.findFirst({
      where: {
        id: giftId,
        userId,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!gift) {
      return res.status(404).json({ message: "Gift introuvable" });
    }

    if (gift.status === "active") {
      return res.status(400).json({ message: "Gift déjà activé" });
    }

    if (!gift.finalConfirmationsAt) {
      return res.status(400).json({
        message: "Les confirmations finales sont requises avant paiement",
      });
    }

    if (!isAllowedOffer(gift.offer)) {
      return res.status(400).json({ message: "Offre invalide" });
    }

    const selectedOffer = offerPrices[gift.offer];
    const appBaseUrl = config.appBaseUrl.replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: gift.user.email,
      client_reference_id: String(gift.id),
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: selectedOffer.name,
              description: gift.title,
            },
            unit_amount: selectedOffer.amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        giftId: String(gift.id),
        userId: String(userId),
      },
      success_url: `${appBaseUrl}/gifts/${gift.id}/activated?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appBaseUrl}/gifts/${gift.id}/summary?payment=cancel`,
    });

    if (!session.url) {
      return res.status(500).json({ message: "Session Stripe invalide" });
    }

    return res.status(201).json({ url: session.url });
  } catch (error) {
    console.error("Erreur lors de la création de session Stripe:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

giftsRouter.post("/:giftId/payment-confirmation", async (req, res) => {
  try {
    const userId = req.authUser?.id;
    const giftId = Number(req.params.giftId);
    const sessionId = normalizeStripeCheckoutSessionId(
      normalizeTextInput(req.body?.sessionId),
    );
    const stripe = getStripeClient();

    if (!userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    if (!Number.isInteger(giftId)) {
      return res.status(400).json({ message: "Gift invalide" });
    }

    if (!sessionId) {
      return res.status(400).json({ message: "Session Stripe manquante" });
    }

    if (!stripe) {
      return res.status(500).json({ message: "Stripe n'est pas configuré" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (
      session.metadata?.giftId !== String(giftId) ||
      session.metadata?.userId !== String(userId)
    ) {
      return res.status(400).json({ message: "Session Stripe invalide" });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Paiement non validé" });
    }

    const gift = await prisma.gift.findFirst({
      where: {
        id: giftId,
        userId,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!gift) {
      return res.status(404).json({ message: "Gift introuvable" });
    }

    if (!isAllowedOffer(gift.offer)) {
      return res.status(400).json({ message: "Offre invalide" });
    }

    const selectedOffer = offerPrices[gift.offer];
    const paidAt = gift.paidAt ?? new Date();
    const nextCheckInDue = nextCheckInDueFrom(paidAt);
    const reference = buildPaymentReference(gift.user.username, gift.id, paidAt);
    const stripePaymentIntentId = getStripePaymentIntentId(session);
    const isSandbox = session.livemode === false;

    if (
      session.currency !== "eur" ||
      session.amount_total !== selectedOffer.amount
    ) {
      return res.status(400).json({ message: "Montant Stripe invalide" });
    }

    const [updatedGift] = await prisma.$transaction([
      prisma.gift.update({
        where: {
          id: giftId,
        },
        data: {
          status: "active",
          draftExpiresAt: null,
          paidAt,
          nextCheckInDue,
          lastEditionStep: "summary",
        },
      }),
      prisma.giftPaymentConfirmation.upsert({
        where: {
          giftId,
        },
        create: {
          reference,
          giftId,
          offer: gift.offer,
          amountCents: selectedOffer.amount,
          currency: "eur",
          status: session.payment_status,
          paidAt,
          stripeSessionId: session.id,
          stripePaymentIntentId,
          isSandbox,
        },
        update: {
          status: session.payment_status,
          stripeSessionId: session.id,
          stripePaymentIntentId,
          isSandbox,
        },
      }),
    ]);

    return res.json({ gift: updatedGift });
  } catch (error) {
    if (isMissingStripeResourceError(error)) {
      return res.status(400).json({ message: "Session Stripe invalide" });
    }

    console.error("Erreur lors de la validation du paiement Stripe:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

giftsRouter.get("/payment-confirmations", async (req, res) => {
  try {
    const userId = req.authUser?.id;

    if (!userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const confirmations = await prisma.giftPaymentConfirmation.findMany({
      where: {
        gift: {
          userId,
        },
      },
      orderBy: {
        paidAt: "desc",
      },
      include: {
        gift: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return res.json({
      confirmations: confirmations.map((confirmation) => ({
        id: confirmation.id,
        reference: confirmation.reference,
        giftId: confirmation.giftId,
        giftTitle: confirmation.gift.title,
        offer: confirmation.offer,
        amountCents: confirmation.amountCents,
        amountPaid: formatAmount(
          confirmation.amountCents,
          confirmation.currency,
        ),
        currency: confirmation.currency.toUpperCase(),
        status: confirmation.status,
        paidAt: confirmation.paidAt,
        stripeSessionId: confirmation.stripeSessionId,
        stripePaymentIntentId: confirmation.stripePaymentIntentId,
        isSandbox: confirmation.isSandbox,
        createdAt: confirmation.createdAt,
      })),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des confirmations:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

giftsRouter.get("/:giftId/payment-confirmation/pdf", async (req, res) => {
  try {
    const userId = req.authUser?.id;
    const giftId = Number(req.params.giftId);

    if (!userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    if (!Number.isInteger(giftId)) {
      return res.status(400).json({ message: "Gift invalide" });
    }

    const paymentConfirmation = await prisma.giftPaymentConfirmation.findFirst({
      where: {
        giftId,
        gift: {
          userId,
        },
      },
      include: {
        gift: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!paymentConfirmation) {
      return res.status(404).json({ message: "Confirmation introuvable" });
    }

    const pdf = createPaymentConfirmationPdf([
      "Confirmation de paiement",
      "Document interne - preuve de transaction. Ce document n'est pas une facture fiscale.",
      `Reference interne : ${paymentConfirmation.reference}`,
      `Gift concerne : ${paymentConfirmation.gift.title}`,
      `Offre choisie : ${paymentConfirmation.offer}`,
      `Montant paye : ${formatAmount(paymentConfirmation.amountCents, paymentConfirmation.currency)}`,
      `Devise : ${paymentConfirmation.currency.toUpperCase()}`,
      `Statut du paiement : ${paymentConfirmation.status}`,
      `Date du paiement : ${formatDateFr(paymentConfirmation.paidAt)}`,
      `Session Stripe : ${paymentConfirmation.stripeSessionId ?? "Non disponible"}`,
      `Payment Intent Stripe : ${paymentConfirmation.stripePaymentIntentId ?? "Non disponible"}`,
      paymentConfirmation.isSandbox
        ? "Mode sandbox : paiement de test, aucun vrai paiement effectue."
        : "Mode reel.",
    ]);
    const filename = `confirmation-paiement-${paymentConfirmation.reference}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", String(pdf.length));

    return res.send(pdf);
  } catch (error) {
    console.error("Erreur lors du téléchargement de confirmation:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

giftsRouter.get("/:giftId", async (req, res) => {
  try {
    const userId = req.authUser?.id;
    const giftId = Number(req.params.giftId);

    if (!userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    if (!Number.isInteger(giftId)) {
      return res.status(400).json({ message: "Gift invalide" });
    }

    const gift = await prisma.gift.findFirst({
      where: {
        id: giftId,
        userId,
      },
    });

    if (!gift) {
      return res.status(404).json({ message: "Gift introuvable" });
    }

    return res.json({ gift });
  } catch (error) {
    console.error("Erreur lors de la récupération du gift:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});
