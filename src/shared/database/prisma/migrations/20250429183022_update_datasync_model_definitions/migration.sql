/*
 Warnings:
 
 - You are about to drop the column `sequenceNumber` on the `IcellDatasync` table. All the data in the column will be lost.
 - Added the required column `sequenceNo` to the `IcellDatasync` table without a default value. This is not possible if the table is not empty.
 
 */
-- DropIndex
DROP INDEX "IcellDatasync_sequenceNumber_idx";

-- AlterTable
ALTER TABLE
  "IcellDatasync" RENAME COLUMN "sequenceNumber" TO "sequenceNo";

-- AlterTable
ALTER TABLE
  "IcellDatasync"
ADD
  COLUMN "keyword" TEXT,
ADD
  COLUMN "requestNo" TEXT;

-- CreateIndex
CREATE INDEX "IcellDatasync_sequenceNo_idx" ON "IcellDatasync"("sequenceNo");