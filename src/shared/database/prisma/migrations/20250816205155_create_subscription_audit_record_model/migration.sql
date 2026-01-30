/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `SecureDDataSync` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SecureDDataSync" DROP COLUMN "updatedAt";

-- CreateTable
CREATE TABLE "SubscriptionAuditRecord" (
    "id" TEXT NOT NULL,
    "msisdn" VARCHAR(15) NOT NULL,
    "operationType" "OperationType" NOT NULL,
    "serviceId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "amountCharged" DECIMAL(10,2),
    "source" TEXT NOT NULL,
    "marketerId" TEXT,
    "acquired" BOOLEAN NOT NULL DEFAULT false,
    "churned" BOOLEAN NOT NULL DEFAULT false,
    "comment" VARCHAR(500),
    "securedDataSyncId" INTEGER,
    "icellDataSyncId" INTEGER NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionAuditRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionAuditRecord_icellDataSyncId_key" ON "SubscriptionAuditRecord"("icellDataSyncId");

-- CreateIndex
CREATE INDEX "SubscriptionAuditRecord_marketerId_acquired_idx" ON "SubscriptionAuditRecord"("marketerId", "acquired");

-- CreateIndex
CREATE INDEX "SubscriptionAuditRecord_createdAt_churned_idx" ON "SubscriptionAuditRecord"("createdAt", "churned");

-- CreateIndex
CREATE INDEX "SubscriptionAuditRecord_msisdn_idx" ON "SubscriptionAuditRecord"("msisdn");

-- CreateIndex
CREATE INDEX "SubscriptionAuditRecord_createdAt_idx" ON "SubscriptionAuditRecord"("createdAt");

-- CreateIndex
CREATE INDEX "SubscriptionAuditRecord_serviceId_idx" ON "SubscriptionAuditRecord"("serviceId");

-- CreateIndex
CREATE INDEX "SubscriptionAuditRecord_marketerId_idx" ON "SubscriptionAuditRecord"("marketerId");

-- CreateIndex
CREATE INDEX "SubscriptionAuditRecord_securedDataSyncId_idx" ON "SubscriptionAuditRecord"("securedDataSyncId");

-- CreateIndex
CREATE INDEX "SubscriptionAuditRecord_icellDataSyncId_idx" ON "SubscriptionAuditRecord"("icellDataSyncId");

-- CreateIndex
CREATE INDEX "SubscriptionAuditRecord_acquired_idx" ON "SubscriptionAuditRecord"("acquired");

-- CreateIndex
CREATE INDEX "SubscriptionAuditRecord_churned_idx" ON "SubscriptionAuditRecord"("churned");

-- AddForeignKey
ALTER TABLE "SubscriptionAuditRecord" ADD CONSTRAINT "SubscriptionAuditRecord_marketerId_fkey" FOREIGN KEY ("marketerId") REFERENCES "Marketer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionAuditRecord" ADD CONSTRAINT "SubscriptionAuditRecord_securedDataSyncId_fkey" FOREIGN KEY ("securedDataSyncId") REFERENCES "SecureDDataSync"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionAuditRecord" ADD CONSTRAINT "SubscriptionAuditRecord_icellDataSyncId_fkey" FOREIGN KEY ("icellDataSyncId") REFERENCES "IcellDatasync"("id") ON DELETE CASCADE ON UPDATE CASCADE;
