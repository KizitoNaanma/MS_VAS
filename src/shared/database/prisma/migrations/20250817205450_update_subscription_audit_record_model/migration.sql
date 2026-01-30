/*
  Warnings:

  - Made the column `marketerId` on table `SubscriptionAuditRecord` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "SubscriptionAuditRecord" DROP CONSTRAINT "SubscriptionAuditRecord_marketerId_fkey";

-- AlterTable
ALTER TABLE "SubscriptionAuditRecord" ALTER COLUMN "marketerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "SubscriptionAuditRecord" ADD CONSTRAINT "SubscriptionAuditRecord_marketerId_fkey" FOREIGN KEY ("marketerId") REFERENCES "Marketer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
