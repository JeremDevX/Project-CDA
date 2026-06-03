import { beforeEach, describe, expect, it, vi } from "vitest";

// Unit tests: database, email and storage are mocked to isolate check-in rules.
const mocks = vi.hoisted(() => ({
  prisma: {
    $transaction: vi.fn(),
    gift: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    checkInReminder: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    thirdPartyValidation: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
  },
  sendEmail: vi.fn(),
  createSignedStorageUrl: vi.fn(),
}));

vi.mock("../../src/database", () => ({
  prisma: mocks.prisma,
}));

vi.mock("../../src/services/email", () => ({
  sendEmail: mocks.sendEmail,
}));

vi.mock("../../src/services/supabaseStorage", () => ({
  createSignedStorageUrl: mocks.createSignedStorageUrl,
}));

import {
  detectOverdueCheckIns,
  escalateCheckInsToTrustedThirds,
  resolveThirdPartyValidationResult,
  sendCheckInFollowUps,
} from "../../src/jobs/checkInReminders";

const dayInMs = 24 * 60 * 60 * 1000;

function daysAgo(now: Date, days: number) {
  return new Date(now.getTime() - days * dayInMs);
}

function sentReminder(now: Date, index: number) {
  return {
    id: index,
    status: "sent",
    sentAt: daysAgo(now, 3 + index),
  };
}

function giftInEscalation(validations: { status: string; createdAt: Date }[]) {
  return {
    id: 1,
    title: "Gift CDA",
    message: "<p>Message final</p>",
    status: "in_escalation",
    user: {
      email: "createur@example.com",
      username: "Jeremie",
    },
    recipients: [
      {
        email: "proche@example.com",
        fullName: "Proche",
      },
    ],
    medias: [
      {
        mediaAsset: {
          type: "image",
          storagePath: "private/image.png",
          originalName: "photo.png",
        },
      },
    ],
    thirdPartyValidations: validations,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.prisma.$transaction.mockResolvedValue([]);
  mocks.prisma.gift.update.mockResolvedValue({});
  mocks.prisma.checkInReminder.findUnique.mockResolvedValue(null);
  mocks.prisma.checkInReminder.create.mockResolvedValue({ id: 10, giftId: 1 });
  mocks.prisma.checkInReminder.update.mockResolvedValue({});
  mocks.prisma.thirdPartyValidation.findUnique.mockResolvedValue(null);
  mocks.prisma.thirdPartyValidation.updateMany.mockResolvedValue({ count: 0 });
  mocks.prisma.thirdPartyValidation.upsert.mockImplementation(({ create }) => ({
    id: create.trustedThirdId,
    ...create,
  }));
  mocks.createSignedStorageUrl.mockResolvedValue("https://signed.example/media");
});

describe("check-in system - jobs", () => {
  it("envoie le mail de check-in quand le delai J+30 est atteint", async () => {
    const now = new Date("2026-06-01T10:00:00.000Z");
    mocks.prisma.gift.findMany.mockResolvedValue([
      {
        id: 1,
        title: "Gift CDA",
        nextCheckInDue: daysAgo(now, 1),
        user: {
          email: "createur@example.com",
          username: "Jeremie",
        },
      },
    ]);

    const count = await detectOverdueCheckIns(now);

    expect(count).toBe(1);
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "createur@example.com",
        subject: "Check-in requis pour Gift CDA",
        text: expect.stringContaining("/check-ins/"),
      }),
    );
    expect(mocks.prisma.checkInReminder.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: {
        status: "sent",
        sentAt: now,
      },
    });
    expect(mocks.prisma.gift.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: "overdue",
      },
    });
  });

  // Same rule, three states: each unanswered reminder opens the next one.
  it.each([
    { sentCount: 1, label: "premiere relance non repondue" },
    { sentCount: 2, label: "deuxieme relance non repondue" },
    { sentCount: 3, label: "troisieme relance non repondue" },
  ])("envoie la relance suivante apres $label", async ({ sentCount }) => {
    const now = new Date("2026-06-10T10:00:00.000Z");
    mocks.prisma.gift.findMany.mockResolvedValue([
      {
        id: 1,
        title: "Gift CDA",
        user: {
          email: "createur@example.com",
          username: "Jeremie",
        },
        checkInReminders: Array.from({ length: sentCount }, (_item, index) =>
          sentReminder(now, index + 1),
        ),
      },
    ]);

    const count = await sendCheckInFollowUps(now);

    expect(count).toBe(1);
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "createur@example.com",
        subject: "Relance check-in pour Gift CDA",
      }),
    );
  });

  it("n'envoie plus de relance apres les trois relances", async () => {
    const now = new Date("2026-06-10T10:00:00.000Z");
    mocks.prisma.gift.findMany.mockResolvedValue([
      {
        id: 1,
        title: "Gift CDA",
        user: {
          email: "createur@example.com",
          username: "Jeremie",
        },
        checkInReminders: Array.from({ length: 4 }, (_item, index) =>
          sentReminder(now, index + 1),
        ),
      },
    ]);

    const count = await sendCheckInFollowUps(now);

    expect(count).toBe(0);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("envoie les mails aux tiers de confiance apres les relances", async () => {
    const now = new Date("2026-06-15T10:00:00.000Z");
    mocks.prisma.gift.findMany.mockResolvedValue([
      {
        id: 1,
        user: {
          username: "Jeremie",
        },
        trustedThirds: [
          {
            id: 10,
            email: "tiers-1@example.com",
            fullName: "Tiers Un",
          },
          {
            id: 11,
            email: "tiers-2@example.com",
            fullName: "Tiers Deux",
          },
        ],
        checkInReminders: Array.from({ length: 4 }, (_item, index) =>
          sentReminder(now, index + 1),
        ),
      },
    ]);

    const count = await escalateCheckInsToTrustedThirds(now);

    expect(count).toBe(1);
    expect(mocks.prisma.thirdPartyValidation.upsert).toHaveBeenCalledTimes(2);
    expect(mocks.sendEmail).toHaveBeenCalledTimes(2);
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "tiers-1@example.com",
        subject: "Validation LegacyGift requise",
        text: expect.stringContaining("/third-party-validations/"),
      }),
    );
    expect(mocks.prisma.gift.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: "in_escalation",
      },
    });
  });

  // Final decision after the third-party response window.
  it("envoie le gift si un tiers confirme le deces et que le delai est passe", async () => {
    const now = new Date("2026-06-10T10:00:00.000Z");
    mocks.prisma.gift.findUnique.mockResolvedValue(
      giftInEscalation([
        {
          status: "confirmed_death",
          createdAt: daysAgo(now, 8),
        },
      ]),
    );

    const result = await resolveThirdPartyValidationResult(1, now);

    expect(result).toBe("delivered");
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "proche@example.com",
        subject: 'Votre gift "Gift CDA" est disponible',
        text: expect.stringContaining("https://signed.example/media"),
      }),
    );
    expect(mocks.prisma.gift.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: "delivered",
      },
    });
  });

  it("n'envoie pas le gift si deux tiers confirment que le createur est vivant", async () => {
    const now = new Date("2026-06-10T10:00:00.000Z");
    mocks.prisma.gift.findUnique.mockResolvedValue(
      giftInEscalation([
        {
          status: "confirmed_alive",
          createdAt: now,
        },
        {
          status: "confirmed_alive",
          createdAt: now,
        },
      ]),
    );

    const result = await resolveThirdPartyValidationResult(1, now);

    expect(result).toBe("expired");
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "createur@example.com",
        subject: 'Gift "Gift CDA" annulé',
      }),
    );
    expect(mocks.sendEmail).not.toHaveBeenCalledWith(
      expect.objectContaining({
        to: "proche@example.com",
      }),
    );
    expect(mocks.prisma.gift.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: "expired",
      },
    });
  });

  it("n'envoie pas le gift sans confirmation de deces apres le delai tiers", async () => {
    const now = new Date("2026-06-10T10:00:00.000Z");
    mocks.prisma.gift.findUnique.mockResolvedValue(
      giftInEscalation([
        {
          status: "pending",
          createdAt: daysAgo(now, 8),
        },
      ]),
    );

    const result = await resolveThirdPartyValidationResult(1, now);

    expect(result).toBe("expired");
    expect(mocks.prisma.thirdPartyValidation.updateMany).toHaveBeenCalledWith({
      where: {
        giftId: 1,
        status: "pending",
      },
      data: {
        status: "silent",
      },
    });
    expect(mocks.sendEmail).not.toHaveBeenCalledWith(
      expect.objectContaining({
        to: "proche@example.com",
      }),
    );
  });
});
