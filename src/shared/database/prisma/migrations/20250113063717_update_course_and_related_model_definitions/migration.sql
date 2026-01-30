/*
  Warnings:

  - You are about to alter the column `progress` on the `CourseEnrollment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.

*/
-- AlterTable
ALTER TABLE "CourseEnrollment" ALTER COLUMN "progress" SET DATA TYPE DECIMAL(5,2);
