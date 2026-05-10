import { Router } from "express";
import { prisma } from "../database";
import { requireAuth } from "../middlewares/requireAuth";

export const giftTrustedThirdsRouter = Router();

const MAX_TRUSTED_THIRD_NAME_LENGTH = 120;
const MAX_TRUSTED_THIRD_EMAIL_LENGTH = 254;
const MAX_TRUSTED_THIRD_PHONE_LENGTH = 20;
const MAX_TRUSTED_THIRD_RELATION_LENGTH = 80;
const REQUIRED_TRUSTED_THIRD_COUNT = 3;

function normalizeTextInput(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

giftTrustedThirdsRouter.get(
  "/:giftId/trusted-thirds",
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

      const trustedThirds = await prisma.giftTrustedThird.findMany({
        where: { giftId },
        orderBy: { createdAt: "asc" },
      });

      return res.json({ trustedThirds });
    } catch (error) {
      console.error(
        "Erreur lors de la recuperation des tiers de confiance:",
        error,
      );
      return res.status(500).json({ message: "Erreur interne de serveur" });
    }
  },
);

giftTrustedThirdsRouter.post(
  "/:giftId/trusted-thirds",
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
      const relation = normalizeTextInput(req.body?.relation);

      if (!fullName || !email || !phone || !relation) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
      }

      if (fullName.length > MAX_TRUSTED_THIRD_NAME_LENGTH) {
        return res.status(400).json({ message: "Nom trop long" });
      }

      if (email.length > MAX_TRUSTED_THIRD_EMAIL_LENGTH || !isValidEmail(email)) {
        return res.status(400).json({ message: "Email invalide" });
      }

      if (phone.length > MAX_TRUSTED_THIRD_PHONE_LENGTH) {
        return res.status(400).json({ message: "Telephone trop long" });
      }

      if (relation.length > MAX_TRUSTED_THIRD_RELATION_LENGTH) {
        return res.status(400).json({ message: "Relation trop longue" });
      }

      const gift = await prisma.gift.findFirst({
        where: { id: giftId, userId },
      });

      if (!gift) {
        return res.status(404).json({ message: "Gift introuvable" });
      }

      const trustedThirdCount = await prisma.giftTrustedThird.count({
        where: { giftId },
      });

      if (trustedThirdCount >= REQUIRED_TRUSTED_THIRD_COUNT) {
        return res.status(400).json({
          message: "Maximum 3 tiers de confiance autorises",
        });
      }

      const trustedThird = await prisma.giftTrustedThird.create({
        data: {
          giftId,
          fullName,
          email,
          phone,
          relation,
        },
      });

      return res.status(201).json({ trustedThird });
    } catch (error) {
      console.error("Erreur lors de l'ajout du tiers de confiance:", error);
      return res.status(500).json({ message: "Erreur interne de serveur" });
    }
  },
);

giftTrustedThirdsRouter.post(
  "/:giftId/trusted-thirds/validate",
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

      const trustedThirdCount = await prisma.giftTrustedThird.count({
        where: { giftId },
      });

      if (trustedThirdCount !== REQUIRED_TRUSTED_THIRD_COUNT) {
        return res.status(400).json({
          message: "Exactement 3 tiers de confiance sont requis",
        });
      }

      return res.json({ canContinue: true });
    } catch (error) {
      console.error(
        "Erreur lors de la validation des tiers de confiance:",
        error,
      );
      return res.status(500).json({ message: "Erreur interne de serveur" });
    }
  },
);

giftTrustedThirdsRouter.delete(
  "/:giftId/trusted-thirds/:trustedThirdId",
  requireAuth,
  async (req, res) => {
    try {
      const userId = req.authUser?.id;
      const giftId = Number(req.params.giftId);
      const trustedThirdId = Number(req.params.trustedThirdId);

      if (!userId) {
        return res.status(401).json({ message: "Non autorise" });
      }

      if (!Number.isInteger(giftId) || !Number.isInteger(trustedThirdId)) {
        return res.status(400).json({ message: "Tiers de confiance invalide" });
      }

      const trustedThird = await prisma.giftTrustedThird.findFirst({
        where: {
          id: trustedThirdId,
          giftId,
          gift: { userId },
        },
      });

      if (!trustedThird) {
        return res
          .status(404)
          .json({ message: "Tiers de confiance introuvable" });
      }

      await prisma.giftTrustedThird.delete({
        where: { id: trustedThird.id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du tiers de confiance:",
        error,
      );
      return res.status(500).json({ message: "Erreur interne de serveur" });
    }
  },
);
