-- AlterTable
ALTER TABLE "SubscriptionAuditRecord" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "SubscriptionAuditRecord" ADD CONSTRAINT "SubscriptionAuditRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
