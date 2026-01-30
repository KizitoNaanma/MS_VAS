/*
  Warnings:

  - Added the required column `themeId` to the `QuizSet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuizSet" ADD COLUMN     "themeId" TEXT NOT NULL,
ALTER COLUMN "timeLimit" SET DEFAULT 60,
ALTER COLUMN "passingScore" SET DEFAULT 100.00;

-- AddForeignKey
ALTER TABLE "QuizSet" ADD CONSTRAINT "QuizSet_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
