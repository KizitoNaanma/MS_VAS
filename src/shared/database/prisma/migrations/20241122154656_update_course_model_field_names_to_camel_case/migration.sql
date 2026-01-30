/*
  Warnings:

  - You are about to drop the column `image_url` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `is_free` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `video_url` on the `Course` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `videoUrl` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "image_url",
DROP COLUMN "is_free",
DROP COLUMN "video_url",
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "videoUrl" TEXT NOT NULL;
