ALTER TABLE "gift_payment_confirmations" DROP CONSTRAINT "gift_payment_confirmations_userId_fkey";

DROP INDEX "gift_payment_confirmations_userId_idx";

ALTER TABLE "gift_payment_confirmations" DROP COLUMN "userId";
