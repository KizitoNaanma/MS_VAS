-- CreateTable
CREATE TABLE "IcellDatasync" (
    "id" SERIAL NOT NULL,
    "serviceType" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "sequenceNumber" TEXT NOT NULL,
    "callingParty" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "resultCode" TEXT NOT NULL,
    "bearerId" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "serviceNode" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "processingTime" TEXT NOT NULL,
    "chargeAmount" TEXT NOT NULL,
    "chargingMode" TEXT NOT NULL,
    "requestedPlan" TEXT NOT NULL,
    "appliedPlan" TEXT NOT NULL,
    "validityType" TEXT NOT NULL,
    "validityDays" TEXT NOT NULL,
    "renFlag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IcellDatasync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IcellDatasync_result_idx" ON "IcellDatasync"("result");

-- CreateIndex
CREATE INDEX "IcellDatasync_sequenceNumber_idx" ON "IcellDatasync"("sequenceNumber");

-- CreateIndex
CREATE INDEX "IcellDatasync_callingParty_idx" ON "IcellDatasync"("callingParty");

-- CreateIndex
CREATE INDEX "IcellDatasync_operationId_idx" ON "IcellDatasync"("operationId");
