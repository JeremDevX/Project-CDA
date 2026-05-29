import { Router } from "express";
import { prisma } from "../database";
import { resolveThirdPartyValidationResult } from "../jobs/checkInReminders";

export const thirdPartyValidationsRouter = Router();

async function answerThirdPartyValidation(
  token: string,
  status: "confirmed_death" | "confirmed_alive",
) {
  const validation = await prisma.thirdPartyValidation.findUnique({
    where: { token },
    include: {
      gift: true,
      trustedThird: true,
    },
  });

  if (!validation) {
    return {
      statusCode: 404,
      message: "Validation introuvable",
    };
  }

  if (validation.gift.status !== "in_escalation") {
    return {
      statusCode: 400,
      message: "Cette validation n'est plus active",
    };
  }

  if (validation.status !== "pending") {
    return {
      statusCode: 200,
      message: "Votre validation a déjà été prise en compte",
    };
  }

  const now = new Date();

  await prisma.thirdPartyValidation.update({
    where: { id: validation.id },
    data: {
      status,
      respondedAt: now,
    },
  });

  await resolveThirdPartyValidationResult(validation.giftId, now);

  return {
    statusCode: 200,
    message: "Votre validation a été prise en compte",
  };
}

thirdPartyValidationsRouter.get("/:token/confirm-death", async (req, res) => {
  try {
    const token = req.params.token;

    if (!token) {
      return res.status(400).json({ message: "Lien de validation invalide" });
    }

    const result = await answerThirdPartyValidation(token, "confirmed_death");

    return res.status(result.statusCode).json({ message: result.message });
  } catch (error) {
    console.error("Erreur lors de la validation tiers:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});

thirdPartyValidationsRouter.get("/:token/confirm-alive", async (req, res) => {
  try {
    const token = req.params.token;

    if (!token) {
      return res.status(400).json({ message: "Lien de validation invalide" });
    }

    const result = await answerThirdPartyValidation(token, "confirmed_alive");

    return res.status(result.statusCode).json({ message: result.message });
  } catch (error) {
    console.error("Erreur lors de la validation tiers:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});
