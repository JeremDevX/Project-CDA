ALTER TABLE "gifts"
ADD COLUMN "nextCheckInDue" TIMESTAMP(3),
ADD COLUMN "lastCheckInAt" TIMESTAMP(3);

UPDATE "gifts"
SET "nextCheckInDue" = "paidAt" + INTERVAL '30 days'
WHERE "status" = 'active'
AND "paidAt" IS NOT NULL
AND "nextCheckInDue" IS NULL;

CREATE TABLE "check_in_reminders" (
  "id" SERIAL NOT NULL,
  "giftId" INTEGER NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "token" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "check_in_reminders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "check_in_responses" (
  "id" SERIAL NOT NULL,
  "reminderId" INTEGER NOT NULL,
  "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isConfirmedAlive" BOOLEAN NOT NULL,

  CONSTRAINT "check_in_responses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "check_in_reminders_token_key" ON "check_in_reminders"("token");
CREATE INDEX "check_in_reminders_giftId_status_idx" ON "check_in_reminders"("giftId", "status");
CREATE UNIQUE INDEX "check_in_responses_reminderId_key" ON "check_in_responses"("reminderId");
CREATE INDEX "gifts_status_nextCheckInDue_idx" ON "gifts"("status", "nextCheckInDue");

ALTER TABLE "check_in_reminders"
ADD CONSTRAINT "check_in_reminders_giftId_fkey"
FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "check_in_responses"
ADD CONSTRAINT "check_in_responses_reminderId_fkey"
FOREIGN KEY ("reminderId") REFERENCES "check_in_reminders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
