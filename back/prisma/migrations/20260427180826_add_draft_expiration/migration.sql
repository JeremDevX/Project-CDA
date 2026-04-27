-- AlterTable
ALTER TABLE "gifts" ADD COLUMN     "draftExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "gifts_status_draftExpiresAt_idx" ON "gifts"("status", "draftExpiresAt");
