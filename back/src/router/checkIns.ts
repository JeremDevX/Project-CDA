import { Router } from "express";
import { prisma } from "../database";
import { nextCheckInDueFrom } from "../jobs/checkInReminders";

export const checkInsRouter = Router();

export async function confirmCheckInByToken(token: string, now = new Date()) {
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return {
      statusCode: 400,
      body: { message: "Lien de check-in invalide" },
    };
  }

  const reminder = await prisma.checkInReminder.findUnique({
    where: { token },
    include: {
      response: true,
      gift: true,
    },
  });

  if (!reminder) {
    return {
      statusCode: 404,
      body: { message: "Lien de check-in introuvable ou expire" },
    };
  }

  if (reminder.response || reminder.status === "responded") {
    return {
      statusCode: 409,
      body: { message: "Ce check-in a deja ete confirme" },
    };
  }

  if (!["pending", "sent"].includes(reminder.status)) {
    return {
      statusCode: 400,
      body: { message: "Ce lien de check-in n'est plus utilisable" },
    };
  }

  if (!["active", "overdue"].includes(reminder.gift.status)) {
    return {
      statusCode: 400,
      body: { message: "Ce check-in n'est plus disponible pour ce gift" },
    };
  }

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

  return {
    statusCode: 200,
    body: {
      message: "Check-in confirme",
      nextCheckInDue,
    },
  };
}

checkInsRouter.get("/:token/confirm", async (req, res) => {
  try {
    const token = String(req.params.token ?? "");
    const result = await confirmCheckInByToken(token);

    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    console.error("Erreur lors de la confirmation du check-in:", error);
    return res.status(500).json({ message: "Erreur interne de serveur" });
  }
});
