/*
  Warnings:

  - Added the required column `aggregator` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobileNetworkOperator` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operationType` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceName` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userPhoneNumber` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('OPT_IN', 'OPT_OUT', 'ONE_TIME', 'RENEWAL');

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "aggregator" TEXT NOT NULL,
ADD COLUMN     "amount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "mobileNetworkOperator" TEXT NOT NULL,
ADD COLUMN     "operationType" "OperationType" NOT NULL,
ADD COLUMN     "serviceId" TEXT NOT NULL,
ADD COLUMN     "serviceName" TEXT NOT NULL,
ADD COLUMN     "userPhoneNumber" TEXT NOT NULL;
