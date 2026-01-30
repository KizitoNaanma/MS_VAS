-- DropForeignKey
ALTER TABLE "SubscriptionAuditRecord" DROP CONSTRAINT "SubscriptionAuditRecord_marketerId_fkey";

-- AlterTable
ALTER TABLE "SubscriptionAuditRecord" ALTER COLUMN "marketerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SubscriptionAuditRecord" ADD CONSTRAINT "SubscriptionAuditRecord_marketerId_fkey" FOREIGN KEY ("marketerId") REFERENCES "Marketer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
