import { Router } from "express";
import Stripe from "stripe";
import { config } from "../config";
import { prisma } from "../database";
import { requireAuth } from "../middlewares/requireAuth";
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

function getStripeClient() {
  if (!config.stripeSecretKey) {
    return null;
  }

  return new Stripe(config.stripeSecretKey);
}

function normalizeTextInput(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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

giftsRouter.post("/", requireAuth, async (req, res) => {
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

giftsRouter.get("/", requireAuth, async (req, res) => {
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
          select: { type: true },
        },
        recipients: {
          select: { id: true },
        },
      },
    });

    const giftsWithMediaCounts = gifts.map(
      ({ medias, recipients, ...gift }) => ({
        ...gift,
        imageCount: medias.filter((media) => media.type === "image").length,
        videoCount: medias.filter((media) => media.type === "video").length,
        recipientCount: recipients.length,
      }),
    );

    return res.json({ gifts: giftsWithMediaCounts });
  } catch (error) {
    console.error("Erreur lors de la récupération des gifts:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

giftsRouter.patch("/:giftId", requireAuth, async (req, res) => {
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

giftsRouter.post("/:giftId/confirmations", requireAuth, async (req, res) => {
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

giftsRouter.post("/:giftId/checkout-session", requireAuth, async (req, res) => {
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
      success_url: `${appBaseUrl}/gifts/${gift.id}/summary?payment=success&session_id={CHECKOUT_SESSION_ID}`,
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

giftsRouter.post("/:giftId/payment-confirmation", requireAuth, async (req, res) => {
  try {
    const userId = req.authUser?.id;
    const giftId = Number(req.params.giftId);
    const sessionId = normalizeTextInput(req.body?.sessionId);
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
    });

    if (!gift) {
      return res.status(404).json({ message: "Gift introuvable" });
    }

    if (!isAllowedOffer(gift.offer)) {
      return res.status(400).json({ message: "Offre invalide" });
    }

    const selectedOffer = offerPrices[gift.offer];

    if (
      session.currency !== "eur" ||
      session.amount_total !== selectedOffer.amount
    ) {
      return res.status(400).json({ message: "Montant Stripe invalide" });
    }

    const updatedGift = await prisma.gift.update({
      where: {
        id: giftId,
      },
      data: {
        status: "active",
        draftExpiresAt: null,
        paidAt: new Date(),
        lastEditionStep: "summary",
      },
    });

    return res.json({ gift: updatedGift });
  } catch (error) {
    console.error("Erreur lors de la validation du paiement Stripe:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

giftsRouter.get("/:giftId", requireAuth, async (req, res) => {
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
