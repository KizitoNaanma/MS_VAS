/*
  Warnings:

  - You are about to drop the column `transactionId` on the `SecureDDataSync` table. All the data in the column will be lost.
  - Added the required column `trxId` to the `SecureDDataSync` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "SecureDDataSync_transactionId_idx";

-- AlterTable
ALTER TABLE "SecureDDataSync" DROP COLUMN "transactionId",
ADD COLUMN     "trxId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "SecureDDataSync_trxId_idx" ON "SecureDDataSync"("trxId");
