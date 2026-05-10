import { Router } from "express";
import { prisma } from "../database";
import { requireAuth } from "../middlewares/requireAuth";
import { getRecipientLimit } from "../helpers/OfferRecipientLimits";

export const giftRecipientsRouter = Router();

const MAX_RECIPIENT_NAME_LENGTH = 120;
const MAX_RECIPIENT_EMAIL_LENGTH = 254;
const MAX_RECIPIENT_PHONE_LENGTH = 20;

function normalizeTextInput(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

giftRecipientsRouter.get(
  "/:giftId/recipients",
  requireAuth,
  async (req, res) => {
    try {
      const userId = req.authUser?.id;
      const giftId = Number(req.params.giftId);

      if (!userId) {
        return res.status(401).json({ message: "Non autorise" });
      }

      if (!Number.isInteger(giftId)) {
        return res.status(400).json({ message: "Gift invalide" });
      }

      const gift = await prisma.gift.findFirst({
        where: { id: giftId, userId },
      });

      if (!gift) {
        return res.status(404).json({ message: "Gift introuvable" });
      }

      const recipients = await prisma.giftRecipient.findMany({
        where: { giftId },
        orderBy: { createdAt: "asc" },
      });

      return res.json({ recipients });
    } catch (error) {
      console.error("Erreur lors de la recuperation des destinataires:", error);
      return res.status(500).json({ message: "Erreur interne de serveur" });
    }
  },
);

giftRecipientsRouter.post(
  "/:giftId/recipients",
  requireAuth,
  async (req, res) => {
    try {
      const userId = req.authUser?.id;
      const giftId = Number(req.params.giftId);

      if (!userId) {
        return res.status(401).json({ message: "Non autorise" });
      }

      if (!Number.isInteger(giftId)) {
        return res.status(400).json({ message: "Gift invalide" });
      }

      const fullName = normalizeTextInput(req.body?.fullName);
      const email = normalizeTextInput(req.body?.email).toLowerCase();
      const phone = normalizeTextInput(req.body?.phone);

      if (!fullName || !email || !phone) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
      }

      if (fullName.length > MAX_RECIPIENT_NAME_LENGTH) {
        return res.status(400).json({ message: "Nom trop long" });
      }

      if (email.length > MAX_RECIPIENT_EMAIL_LENGTH || !isValidEmail(email)) {
        return res.status(400).json({ message: "Email invalide" });
      }

      if (phone.length > MAX_RECIPIENT_PHONE_LENGTH) {
        return res.status(400).json({ message: "Telephone trop long" });
      }

      const gift = await prisma.gift.findFirst({
        where: { id: giftId, userId },
      });

      if (!gift) {
        return res.status(404).json({ message: "Gift introuvable" });
      }

      const limit = getRecipientLimit(gift.offer);

      if (limit === undefined) {
        return res
          .status(400)
          .json({ message: "Offre requise avant ajout de destinataire" });
      }

      const currentCount = await prisma.giftRecipient.count({
        where: { giftId },
      });

      if (limit !== null && currentCount >= limit) {
        return res
          .status(400)
          .json({ message: "Limite de destinataires atteinte" });
      }

      const recipient = await prisma.giftRecipient.create({
        data: {
          giftId,
          fullName,
          email,
          phone,
        },
      });

      return res.status(201).json({ recipient });
    } catch (error) {
      console.error("Erreur lors de l'ajout du destinataire:", error);
      return res.status(500).json({ message: "Erreur interne de serveur" });
    }
  },
);

giftRecipientsRouter.delete(
  "/:giftId/recipients/:recipientId",
  requireAuth,
  async (req, res) => {
    try {
      const userId = req.authUser?.id;
      const giftId = Number(req.params.giftId);
      const recipientId = Number(req.params.recipientId);

      if (!userId) {
        return res.status(401).json({ message: "Non autorise" });
      }

      if (!Number.isInteger(giftId) || !Number.isInteger(recipientId)) {
        return res.status(400).json({ message: "Destinataire invalide" });
      }

      const recipient = await prisma.giftRecipient.findFirst({
        where: {
          id: recipientId,
          giftId,
          gift: { userId },
        },
      });

      if (!recipient) {
        return res.status(404).json({ message: "Destinataire introuvable" });
      }

      await prisma.giftRecipient.delete({
        where: { id: recipient.id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error("Erreur lors de la suppression du destinataire:", error);
      return res.status(500).json({ message: "Erreur interne de serveur" });
    }
  },
);
