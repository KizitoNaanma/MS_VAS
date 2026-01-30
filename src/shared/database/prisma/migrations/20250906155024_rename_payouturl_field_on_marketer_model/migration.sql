/*
  Warnings:

  - You are about to drop the column `payoutUrl` on the `Marketer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Marketer" DROP COLUMN "payoutUrl",
ADD COLUMN     "payout" TEXT NOT NULL DEFAULT '0.25';
