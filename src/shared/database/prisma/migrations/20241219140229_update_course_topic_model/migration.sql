/*
  Warnings:

  - Added the required column `courseCategoryId` to the `CourseTopic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CourseTopic" ADD COLUMN     "courseCategoryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "CourseTopic" ADD CONSTRAINT "CourseTopic_courseCategoryId_fkey" FOREIGN KEY ("courseCategoryId") REFERENCES "CourseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
