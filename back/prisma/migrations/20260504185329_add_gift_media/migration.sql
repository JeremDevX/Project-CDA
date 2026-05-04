-- CreateTable
CREATE TABLE "gift_media" (
    "id" SERIAL NOT NULL,
    "giftId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "originalName" TEXT,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gift_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gift_media_storagePath_key" ON "gift_media"("storagePath");

-- CreateIndex
CREATE INDEX "gift_media_giftId_type_idx" ON "gift_media"("giftId", "type");

-- AddForeignKey
ALTER TABLE "gift_media" ADD CONSTRAINT "gift_media_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
