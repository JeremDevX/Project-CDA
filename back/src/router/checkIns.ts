import { Router } from "express";
import { prisma } from "../database";
import { nextCheckInDueFrom } from "../jobs/checkInReminders";

export const checkInsRouter = Router();

checkInsRouter.get("/:token/confirm", async (req, res) => {
  try {
    const token = String(req.params.token ?? "");

    if (!/^[a-f0-9]{64}$/.test(token)) {
      return res.status(400).json({ message: "Token de check-in invalide" });
    }

    const reminder = await prisma.checkInReminder.findUnique({
      where: { token },
      include: {
        response: true,
        gift: true,
      },
    });

    if (!reminder) {
      return res.status(404).json({ message: "Check-in introuvable" });
    }

    if (reminder.response || reminder.status === "responded") {
      return res.status(409).json({ message: "Check-in deja confirme" });
    }

    if (!["pending", "sent"].includes(reminder.status)) {
      return res.status(400).json({ message: "Check-in non confirmable" });
    }

    if (!["active", "overdue"].includes(reminder.gift.status)) {
      return res.status(400).json({ message: "Gift non confirmable" });
    }

    const now = new Date();
    const nextCheckInDue = nextCheckInDueFrom(now);

    await prisma.$transaction([
      prisma.checkInResponse.create({
        data: {
          reminderId: reminder.id,
          isConfirmedAlive: true,
          respondedAt: now,
        },
      }),
      prisma.checkInReminder.update({
        where: { id: reminder.id },
        data: {
          status: "responded",
        },
      }),
      prisma.gift.update({
        where: { id: reminder.giftId },
        data: {
          status: "active",
          lastCheckInAt: now,
          nextCheckInDue,
        },
      }),
    ]);

    return res.json({
      message: "Check-in confirme",
      nextCheckInDue,
    });
  } catch (error) {
    console.error("Erreur lors de la confirmation du check-in:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});
