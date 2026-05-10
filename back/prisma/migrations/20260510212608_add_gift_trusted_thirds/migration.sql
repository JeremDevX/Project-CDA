-- CreateTable
CREATE TABLE "gift_trusted_thirds" (
    "id" SERIAL NOT NULL,
    "giftId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_trusted_thirds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gift_trusted_thirds_giftId_idx" ON "gift_trusted_thirds"("giftId");

-- AddForeignKey
ALTER TABLE "gift_trusted_thirds" ADD CONSTRAINT "gift_trusted_thirds_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
