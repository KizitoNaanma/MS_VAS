/*
  Warnings:

  - Added the required column `religionId` to the `Theme` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Theme" ADD COLUMN     "religionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_religionId_fkey" FOREIGN KEY ("religionId") REFERENCES "Religion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
