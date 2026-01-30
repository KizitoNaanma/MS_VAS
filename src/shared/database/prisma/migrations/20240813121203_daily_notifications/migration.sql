-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailyNotications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "preferredNoticationTime" TIMESTAMP(3);
