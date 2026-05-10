-- CreateTable
CREATE TABLE "gift_recipients" (
    "id" SERIAL NOT NULL,
    "giftId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gift_recipients_giftId_idx" ON "gift_recipients"("giftId");

-- AddForeignKey
ALTER TABLE "gift_recipients" ADD CONSTRAINT "gift_recipients_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
