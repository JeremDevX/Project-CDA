-- CreateTable
CREATE TABLE "gifts" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Nouveau gift',
    "status" TEXT NOT NULL DEFAULT 'brouillon',
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gifts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
