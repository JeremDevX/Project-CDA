CREATE TABLE "third_party_validations" (
  "id" SERIAL NOT NULL,
  "giftId" INTEGER NOT NULL,
  "trustedThirdId" INTEGER NOT NULL,
  "token" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "respondedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "third_party_validations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "third_party_validations_token_key" ON "third_party_validations"("token");
CREATE UNIQUE INDEX "third_party_validations_giftId_trustedThirdId_key" ON "third_party_validations"("giftId", "trustedThirdId");
CREATE INDEX "third_party_validations_giftId_status_idx" ON "third_party_validations"("giftId", "status");

ALTER TABLE "third_party_validations"
ADD CONSTRAINT "third_party_validations_giftId_fkey"
FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "third_party_validations"
ADD CONSTRAINT "third_party_validations_trustedThirdId_fkey"
FOREIGN KEY ("trustedThirdId") REFERENCES "gift_trusted_thirds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
