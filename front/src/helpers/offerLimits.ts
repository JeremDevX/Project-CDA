import { offerPlans, type OfferPlanId } from "../data/offerPlans";

export type GiftSlotSummary = {
  recipientLimit: number | null;
  imageLimit?: number | null;
  videoLimit?: number;
};

export function getGiftSlotSummary(
  offer?: OfferPlanId | null,
): GiftSlotSummary | null {
  const plan = offerPlans.find((currentPlan) => currentPlan.id === offer);

  if (!plan) {
    return null;
  }

  return {
    recipientLimit: plan.recipientLimit,
    imageLimit: plan.imageLimit === 0 ? undefined : plan.imageLimit,
    videoLimit: plan.allowsVideo ? 1 : undefined,
  };
}
