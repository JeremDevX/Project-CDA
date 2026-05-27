import crypto from "node:crypto";
import nodeCron from "node-cron";
import { config } from "../config";
import { prisma } from "../database";
import { sendEmail } from "../services/email";

const CHECK_IN_INTERVAL_DAYS = 30;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function nextCheckInDueFrom(date: Date) {
  return new Date(date.getTime() + CHECK_IN_INTERVAL_DAYS * DAY_IN_MS);
}

function buildCheckInLink(token: string) {
  return `${config.apiBaseUrl.replace(/\/$/, "")}/check-ins/${token}/confirm`;
}

function createCheckInToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function createUniqueCheckInToken() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = createCheckInToken();
    const existingReminder = await prisma.checkInReminder.findUnique({
      where: { token },
    });

    if (!existingReminder) {
      return token;
    }
  }

  throw new Error("Impossible de generer un token de check-in unique");
}

export async function detectOverdueCheckIns(now = new Date()) {
  const gifts = await prisma.gift.findMany({
    where: {
      status: "active",
      nextCheckInDue: {
        lte: now,
      },
      checkInReminders: {
        none: {
          status: {
            in: ["pending", "sent"],
          },
        },
      },
    },
    include: {
      user: {
        select: {
          email: true,
          username: true,
        },
      },
    },
  });

  for (const gift of gifts) {
    const token = await createUniqueCheckInToken();
    const reminder = await prisma.checkInReminder.create({
      data: {
        giftId: gift.id,
        dueDate: gift.nextCheckInDue ?? now,
        token,
        status: "pending",
      },
    });

    await sendEmail({
      to: gift.user.email,
      subject: `Check-in requis pour ${gift.title}`,
      text: [
        `Bonjour ${gift.user.username},`,
        "",
        `Votre gift "${gift.title}" attend votre check-in.`,
        "Confirmez que vous etes toujours en vie via ce lien :",
        buildCheckInLink(token),
      ].join("\n"),
    });

    await prisma.$transaction([
      prisma.checkInReminder.update({
        where: { id: reminder.id },
        data: {
          status: "sent",
          sentAt: now,
        },
      }),
      prisma.gift.update({
        where: { id: gift.id },
        data: {
          status: "overdue",
        },
      }),
    ]);
  }

  return gifts.length;
}

export function scheduleCheckInReminders() {
  nodeCron.schedule("0 2 * * *", async () => {
    try {
      const detectedCount = await detectOverdueCheckIns();
      console.log("Check-ins en retard detectes : ", detectedCount);
    } catch (error) {
      console.error("Erreur lors de la detection des check-ins : ", error);
    }
  });
}
