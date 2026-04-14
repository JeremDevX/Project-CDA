import { Router } from "express";
import { prisma } from "../database";
import { requireAuth } from "../middlewares/requireAuth";

export const giftsRouter = Router();

function normalizeTitle(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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
