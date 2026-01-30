/*
  Warnings:

  - Added the required column `dayId` to the `DailyPrayer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DailyPrayer" ADD COLUMN     "dayId" INTEGER NOT NULL;
