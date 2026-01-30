/*
  Warnings:

  - You are about to drop the column `dailyNotications` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferredNoticationTime` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "dailyNotications",
DROP COLUMN "preferredNoticationTime",
ADD COLUMN     "dailyNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preferredNotificationTime" TIMESTAMP(3);
