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

function buildTrustedThirdValidationLink(token: string) {
  return `${config.appBaseUrl.replace(/\/$/, "")}/third-party-validations/${token}/confirm-death`;
}

function buildTrustedThirdAliveLink(token: string) {
  return `${config.appBaseUrl.replace(/\/$/, "")}/third-party-validations/${token}/confirm-alive`;
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

async function createUniqueThirdPartyValidationToken() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = createCheckInToken();
    const existingValidation = await prisma.thirdPartyValidation.findUnique({
      where: { token },
    });

    if (!existingValidation) {
      return token;
    }
  }

  throw new Error("Impossible de generer un token de validation tiers unique");
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

async function sendTrustedThirdEscalationEmail(params: {
  email: string;
  fullName: string;
  username: string;
  validationToken: string;
}) {
  await sendEmail({
    to: params.email,
    subject: "Validation LegacyGift requise",
    text: [
      `Bonjour ${params.fullName},`,
      "",
      `${params.username} vous a désigné comme tiers de confiance sur LegacyGift.`,
      "",
      "LegacyGift permet à une personne de préparer un message destiné à ses proches, qui ne pourra être transmis qu'en cas de décès.",
      "",
      `Nous vous contactons car ${params.username} n'a pas répondu aux dernières confirmations demandées par le service.`,
      "",
      "Cela ne veut pas dire que son décès est certain. Avant d'aller plus loin, nous avons besoin de l'avis des personnes de confiance qu'il ou elle avait choisies, afin d'éviter toute erreur.",
      "",
      `Si vous savez avec certitude que ${params.username} est décédé, vous pouvez le confirmer avec ce lien sécurisé :`,
      buildTrustedThirdValidationLink(params.validationToken),
      "",
      `Si au contraire vous savez que ${params.username} est vivant, vous pouvez nous l'indiquer ici :`,
      buildTrustedThirdAliveLink(params.validationToken),
      "",
      "Si vous avez le moindre doute, ne faites rien. Votre absence de réponse ne déclenchera aucune transmission.",
      "",
      "Aucun contenu personnel ne vous est communiqué dans cet email, et aucun document ne vous sera demandé.",
      "",
      "Par mesure de sécurité, si vous souhaitez vérifier la légitimité de cette demande avant d'interagir avec les liens ci-dessus, vous pouvez consulter directement notre site officiel : https://legacygift.fr",
      "",
      "Merci pour votre attention.",
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

export async function escalateCheckInsToTrustedThirds(now = new Date()) {
  const escalationCutoff = new Date(
    now.getTime() - CHECK_IN_REMINDER_DELAY_DAYS * DAY_IN_MS,
  );
  const gifts = await prisma.gift.findMany({
    where: {
      status: "overdue",
      checkInReminders: {
        some: {
          status: "sent",
          sentAt: {
            lte: escalationCutoff,
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
          username: true,
        },
      },
      trustedThirds: {
        orderBy: {
          createdAt: "asc",
        },
      },
      checkInReminders: {
        orderBy: {
          sentAt: "desc",
        },
      },
    },
  });

  let escalatedCount = 0;

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
      sentReminders.length < MAX_CHECK_IN_REMINDERS ||
      !latestSentReminder?.sentAt ||
      latestSentReminder.sentAt > escalationCutoff ||
      gift.trustedThirds.length === 0
    ) {
      continue;
    }

    for (const trustedThird of gift.trustedThirds) {
      const validationToken = await createUniqueThirdPartyValidationToken();
      const validation = await prisma.thirdPartyValidation.upsert({
        where: {
          giftId_trustedThirdId: {
            giftId: gift.id,
            trustedThirdId: trustedThird.id,
          },
        },
        update: {},
        create: {
          giftId: gift.id,
          trustedThirdId: trustedThird.id,
          token: validationToken,
          status: "pending",
        },
      });

      await sendTrustedThirdEscalationEmail({
        email: trustedThird.email,
        fullName: trustedThird.fullName,
        username: gift.user.username,
        validationToken: validation.token,
      });
    }

    await prisma.gift.update({
      where: { id: gift.id },
      data: {
        status: "in_escalation",
      },
    });

    escalatedCount += 1;
  }

  return escalatedCount;
}

export function scheduleCheckInReminders() {
  nodeCron.schedule("0 2 * * *", async () => {
    try {
      const detectedCount = await detectOverdueCheckIns();
      const followUpCount = await sendCheckInFollowUps();
      const escalatedCount = await escalateCheckInsToTrustedThirds();
      console.log("Check-ins en retard detectes : ", detectedCount);
      console.log("Relances check-in envoyees : ", followUpCount);
      console.log("Escalades check-in declenchees : ", escalatedCount);
    } catch (error) {
      console.error("Erreur lors de la detection des check-ins : ", error);
    }
  });
}
