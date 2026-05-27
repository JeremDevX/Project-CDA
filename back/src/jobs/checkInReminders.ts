import crypto from "node:crypto";
import nodeCron from "node-cron";
import { config } from "../config";
import { prisma } from "../database";
import { sendEmail } from "../services/email";

const CHECK_IN_INTERVAL_DAYS = 30;
const CHECK_IN_REMINDER_DELAY_DAYS = 3;
const MAX_CHECK_IN_REMINDERS = 4;
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

async function sendCheckInReminderEmail(params: {
  email: string;
  username: string;
  giftTitle: string;
  token: string;
  isFollowUp?: boolean;
}) {
  await sendEmail({
    to: params.email,
    subject: params.isFollowUp
      ? `Relance check-in pour ${params.giftTitle}`
      : `Check-in requis pour ${params.giftTitle}`,
    text: [
      `Bonjour ${params.username},`,
      "",
      params.isFollowUp
        ? `Votre gift "${params.giftTitle}" attend toujours votre check-in.`
        : `Votre gift "${params.giftTitle}" attend votre check-in.`,
      "Confirmez que vous etes toujours en vie via ce lien :",
      buildCheckInLink(params.token),
    ].join("\n"),
  });
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

    await sendCheckInReminderEmail({
      email: gift.user.email,
      username: gift.user.username,
      giftTitle: gift.title,
      token,
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

export async function sendCheckInFollowUps(now = new Date()) {
  const followUpCutoff = new Date(
    now.getTime() - CHECK_IN_REMINDER_DELAY_DAYS * DAY_IN_MS,
  );
  const gifts = await prisma.gift.findMany({
    where: {
      status: "overdue",
      checkInReminders: {
        some: {
          status: "sent",
          sentAt: {
            lte: followUpCutoff,
          },
        },
        none: {
          status: "pending",
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
      checkInReminders: {
        orderBy: {
          sentAt: "desc",
        },
      },
    },
  });

  let sentCount = 0;

  for (const gift of gifts) {
    const hasResponse = gift.checkInReminders.some(
      (reminder) => reminder.status === "responded",
    );
    const sentReminders = gift.checkInReminders.filter(
      (reminder) => reminder.status === "sent" && reminder.sentAt,
    );
    const latestSentReminder = sentReminders[0];

    if (
      hasResponse ||
      !latestSentReminder?.sentAt ||
      latestSentReminder.sentAt > followUpCutoff ||
      gift.checkInReminders.length >= MAX_CHECK_IN_REMINDERS
    ) {
      continue;
    }

    const token = await createUniqueCheckInToken();
    const reminder = await prisma.checkInReminder.create({
      data: {
        giftId: gift.id,
        dueDate: now,
        token,
        status: "pending",
      },
    });

    await sendCheckInReminderEmail({
      email: gift.user.email,
      username: gift.user.username,
      giftTitle: gift.title,
      token,
      isFollowUp: true,
    });

    await prisma.checkInReminder.update({
      where: { id: reminder.id },
      data: {
        status: "sent",
        sentAt: now,
      },
    });

    sentCount += 1;
  }

  return sentCount;
}

export function scheduleCheckInReminders() {
  nodeCron.schedule("0 2 * * *", async () => {
    try {
      const detectedCount = await detectOverdueCheckIns();
      const followUpCount = await sendCheckInFollowUps();
      console.log("Check-ins en retard detectes : ", detectedCount);
      console.log("Relances check-in envoyees : ", followUpCount);
    } catch (error) {
      console.error("Erreur lors de la detection des check-ins : ", error);
    }
  });
}
