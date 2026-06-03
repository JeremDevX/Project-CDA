import { beforeEach, describe, expect, it, vi } from "vitest";

// Route handlers are tested through their business functions, without HTTP server.
const mocks = vi.hoisted(() => ({
  prisma: {
    $transaction: vi.fn(),
    gift: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    checkInReminder: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    checkInResponse: {
      create: vi.fn(),
    },
    thirdPartyValidation: {
      findUnique: vi.fn(),
      update: vi.fn(),
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

import { confirmCheckInByToken } from "../../src/router/checkIns";
import { answerThirdPartyValidation } from "../../src/router/thirdPartyValidations";

const dayInMs = 24 * 60 * 60 * 1000;

function daysAgo(now: Date, days: number) {
  return new Date(now.getTime() - days * dayInMs);
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.prisma.$transaction.mockResolvedValue([]);
  mocks.prisma.gift.update.mockResolvedValue({});
  mocks.prisma.checkInReminder.update.mockResolvedValue({});
  mocks.prisma.checkInResponse.create.mockResolvedValue({});
  mocks.prisma.thirdPartyValidation.update.mockResolvedValue({});
  mocks.prisma.thirdPartyValidation.updateMany.mockResolvedValue({ count: 0 });
  mocks.createSignedStorageUrl.mockResolvedValue("https://signed.example/media");
});

describe("check-in system - routes publiques", () => {
  it("enregistre la confirmation de vie et repart sur 30 jours", async () => {
    const now = new Date("2026-06-01T10:00:00.000Z");
    const token = "a".repeat(64);
    mocks.prisma.checkInReminder.findUnique.mockResolvedValue({
      id: 5,
      giftId: 1,
      status: "sent",
      response: null,
      gift: {
        id: 1,
        status: "overdue",
      },
    });

    const result = await confirmCheckInByToken(token, now);

    const expectedNextDate = new Date(now.getTime() + 30 * dayInMs);
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({
      message: "Check-in confirme",
      nextCheckInDue: expectedNextDate,
    });
    expect(mocks.prisma.checkInResponse.create).toHaveBeenCalledWith({
      data: {
        reminderId: 5,
        isConfirmedAlive: true,
        respondedAt: now,
      },
    });
    expect(mocks.prisma.gift.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: "active",
        lastCheckInAt: now,
        nextCheckInDue: expectedNextDate,
      },
    });
  });

  it("enregistre la reponse d'un tiers puis livre le gift apres le delai", async () => {
    const now = new Date("2026-06-10T10:00:00.000Z");
    const token = "validation-token";
    mocks.prisma.thirdPartyValidation.findUnique.mockResolvedValue({
      id: 7,
      giftId: 1,
      status: "pending",
      gift: {
        status: "in_escalation",
      },
      trustedThird: {
        id: 12,
      },
    });
    mocks.prisma.gift.findUnique.mockResolvedValue({
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
      medias: [],
      thirdPartyValidations: [
        {
          status: "confirmed_death",
          createdAt: daysAgo(now, 8),
        },
      ],
    });

    const result = await answerThirdPartyValidation(
      token,
      "confirmed_death",
      now,
    );

    expect(result.statusCode).toBe(200);
    expect(result.message).toBe("Votre validation a été prise en compte");
    expect(mocks.prisma.thirdPartyValidation.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: {
        status: "confirmed_death",
        respondedAt: now,
      },
    });
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "proche@example.com",
        subject: 'Votre gift "Gift CDA" est disponible',
      }),
    );
    expect(mocks.prisma.gift.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: "delivered",
      },
    });
  });
});
