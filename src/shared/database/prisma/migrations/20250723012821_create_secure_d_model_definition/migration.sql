-- CreateTable
CREATE TABLE "SecureDDataSync" (
    "id" SERIAL NOT NULL,
    "msisdn" TEXT NOT NULL,
    "activation" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecureDDataSync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SecureDDataSync_msisdn_idx" ON "SecureDDataSync"("msisdn");

-- CreateIndex
CREATE INDEX "SecureDDataSync_transactionId_idx" ON "SecureDDataSync"("transactionId");

-- CreateIndex
CREATE INDEX "SecureDDataSync_productId_idx" ON "SecureDDataSync"("productId");
