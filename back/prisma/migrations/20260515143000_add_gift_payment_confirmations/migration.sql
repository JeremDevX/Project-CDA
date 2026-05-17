CREATE TABLE "gift_payment_confirmations" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "giftId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "offer" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "isSandbox" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_payment_confirmations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gift_payment_confirmations_reference_key" ON "gift_payment_confirmations"("reference");
CREATE UNIQUE INDEX "gift_payment_confirmations_giftId_key" ON "gift_payment_confirmations"("giftId");
CREATE INDEX "gift_payment_confirmations_userId_idx" ON "gift_payment_confirmations"("userId");

ALTER TABLE "gift_payment_confirmations" ADD CONSTRAINT "gift_payment_confirmations_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "gift_payment_confirmations" ADD CONSTRAINT "gift_payment_confirmations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
