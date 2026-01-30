/*
  Warnings:

  - Added the required column `religionId` to the `CourseCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `religionId` to the `CourseTopic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CourseCategory" ADD COLUMN     "religionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CourseTopic" ADD COLUMN     "religionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "CourseCategory" ADD CONSTRAINT "CourseCategory_religionId_fkey" FOREIGN KEY ("religionId") REFERENCES "Religion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseTopic" ADD CONSTRAINT "CourseTopic_religionId_fkey" FOREIGN KEY ("religionId") REFERENCES "Religion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
