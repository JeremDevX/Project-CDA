import type { GiftEditionStep } from "../api/gifts";

export type GiftProgressStep = {
  number: number;
  label: string;
  pathStep: GiftEditionStep;
  steps: GiftEditionStep[];
};

export const giftProgressSteps: GiftProgressStep[] = [
  {
    number: 1,
    label: "Rédiger",
    pathStep: "creation-mode",
    steps: ["creation-mode", "composition"],
  },
  {
    number: 2,
    label: "Images",
    pathStep: "images",
    steps: ["images"],
  },
  {
    number: 3,
    label: "Prévisualiser",
    pathStep: "preview",
    steps: ["preview"],
  },
  {
    number: 4,
    label: "Destinataires",
    pathStep: "recipients",
    steps: ["recipients"],
  },
  {
    number: 5,
    label: "Tiers",
    pathStep: "trusted-thirds",
    steps: ["trusted-thirds"],
  },
  {
    number: 6,
    label: "Récapitulatif",
    pathStep: "confirmations",
    steps: ["confirmations", "summary"],
  },
];

const stepOrder = giftProgressSteps.flatMap((step) => step.steps);

export function getGiftStepPath(giftId: number, step: GiftEditionStep) {
  return `/gifts/${giftId}/${step}`;
}

export function getLastGiftEditionPath(
  giftId: number,
  lastEditionStep?: GiftEditionStep | null,
) {
  return `/gifts/${giftId}/${lastEditionStep ?? "pricing"}`;
}

export function getGiftProgressNumber(step?: GiftEditionStep | null) {
  return (
    giftProgressSteps.find((progressStep) =>
      progressStep.steps.includes(step as GiftEditionStep),
    )?.number ?? 0
  );
}

export function getGiftProgressPercent(step?: GiftEditionStep | null) {
  return Math.round(
    (getGiftProgressNumber(step) / giftProgressSteps.length) * 100,
  );
}

export function getMaxGiftStep(
  currentStep: GiftEditionStep,
  lastEditionStep?: GiftEditionStep | null,
) {
  const currentIndex = stepOrder.indexOf(currentStep);
  const lastIndex = stepOrder.indexOf(lastEditionStep ?? currentStep);

  return stepOrder[Math.max(currentIndex, lastIndex)] ?? currentStep;
}
