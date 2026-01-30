/*
  Warnings:

  - Added the required column `adjective` to the `Religion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `noun` to the `Religion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Religion" ADD COLUMN     "adjective" TEXT NOT NULL,
ADD COLUMN     "noun" TEXT NOT NULL;
