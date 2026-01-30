/*
 Warnings:
 
 - You are about to rename the column `sequenceNumber` on the `Subscription` table. 
 
 */
-- AlterTable
ALTER TABLE
  "Subscription" RENAME COLUMN "sequenceNumber" TO "sequenceNo";