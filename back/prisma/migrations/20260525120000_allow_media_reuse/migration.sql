CREATE TABLE "media_assets" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "originalName" TEXT,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

INSERT INTO "media_assets" ("userId", "type", "storagePath", "originalName", "mimeType", "sizeBytes", "createdAt")
SELECT DISTINCT ON (gm."storagePath")
    g."userId",
    gm."type",
    gm."storagePath",
    gm."originalName",
    gm."mimeType",
    gm."sizeBytes",
    gm."createdAt"
FROM "gift_media" gm
INNER JOIN "gifts" g ON g."id" = gm."giftId"
ORDER BY gm."storagePath", gm."createdAt" ASC;

ALTER TABLE "gift_media" ADD COLUMN "mediaAssetId" INTEGER;

UPDATE "gift_media" gm
SET "mediaAssetId" = ma."id"
FROM "media_assets" ma
WHERE ma."storagePath" = gm."storagePath";

ALTER TABLE "gift_media" ALTER COLUMN "mediaAssetId" SET NOT NULL;

DROP INDEX "gift_media_storagePath_key";
DROP INDEX "gift_media_giftId_type_idx";

ALTER TABLE "gift_media" DROP COLUMN "type";
ALTER TABLE "gift_media" DROP COLUMN "storagePath";
ALTER TABLE "gift_media" DROP COLUMN "originalName";
ALTER TABLE "gift_media" DROP COLUMN "mimeType";
ALTER TABLE "gift_media" DROP COLUMN "sizeBytes";

CREATE UNIQUE INDEX "media_assets_storagePath_key" ON "media_assets"("storagePath");
CREATE INDEX "media_assets_userId_type_idx" ON "media_assets"("userId", "type");
CREATE INDEX "gift_media_giftId_idx" ON "gift_media"("giftId");
CREATE INDEX "gift_media_mediaAssetId_idx" ON "gift_media"("mediaAssetId");
CREATE UNIQUE INDEX "gift_media_giftId_mediaAssetId_key" ON "gift_media"("giftId", "mediaAssetId");

ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "gift_media" ADD CONSTRAINT "gift_media_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
