/*
  Warnings:

  - A unique constraint covering the columns `[prefix]` on the table `Marketer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Marketer_prefix_idx" ON "Marketer"("prefix");

-- CreateIndex
CREATE UNIQUE INDEX "Marketer_prefix_key" ON "Marketer"("prefix");
