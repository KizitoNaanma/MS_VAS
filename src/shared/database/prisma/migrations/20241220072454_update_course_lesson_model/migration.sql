/*
  Warnings:

  - You are about to drop the column `code` on the `CourseLesson` table. All the data in the column will be lost.
  - Added the required column `content` to the `CourseLesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ordering` to the `CourseLesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CourseLesson" DROP COLUMN "code",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "ordering" INTEGER NOT NULL;
