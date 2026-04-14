import { Router } from "express";
import { prisma } from "../database";
import { requireAuth } from "../middlewares/requireAuth";

export const giftsRouter = Router();

function normalizeTitle(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

const allowedOffers = ["essentiel", "standard", "premium"] as const;

function isAllowedOffer(value: unknown) {
  return typeof value === "string" && allowedOffers.includes(value as never);
}

giftsRouter.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.authUser?.id;

    if (!userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const title = normalizeTitle(req.body?.title || "Nouveau gift");

    const gift = await prisma.gift.create({
      data: {
        title,
        status: "brouillon",
        userId,
      },
    });

    return res.status(201).json({ gift });
  } catch (error) {
    console.error("Erreur lors de la création du gift:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

giftsRouter.patch("/:giftId/offer", requireAuth, async (req, res) => {
  try {
    const userId = req.authUser?.id;
    const giftId = Number(req.params.giftId);
    const offer = req.body?.offer;

    if (!userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }
    if (!Number(giftId)) {
      return res.status(400).json({ message: "Gift invalide" });
    }
    if (!isAllowedOffer(offer)) {
      return res.status(400).json({ message: "Offre invalide" });
    }

    const existingGift = await prisma.gift.findFirst({
      where: {
        id: giftId,
        userId,
      },
    });
    if (!existingGift) {
      return res.status(400).json({ message: "Gift introuvable" });
    }

    const gift = await prisma.gift.update({
      where: {
        id: giftId,
      },
      data: {
        offer,
      },
    });

    return res.json({ gift });
  } catch (error) {
    console.error("Erreur lors du choix de l'offre", error);
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
    });

    return res.json({ gifts });
  } catch (error) {
    console.error("Erreur lors de la récupération des gifts:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});
