/*
  Warnings:

  - Added the required column `dayId` to the `QuizSet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuizSet" ADD COLUMN     "dayId" INTEGER NOT NULL;
