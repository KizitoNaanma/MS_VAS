/*
  Warnings:

  - The values [OPT_IN,OPT_OUT,ONE_TIME] on the enum `OperationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OperationType_new" AS ENUM ('SUBSCRIPTION', 'UNSUBSCRIPTION', 'ONDEMAND', 'RENEWAL');
ALTER TABLE "Subscription" ALTER COLUMN "operationType" TYPE "OperationType_new" USING ("operationType"::text::"OperationType_new");
ALTER TYPE "OperationType" RENAME TO "OperationType_old";
ALTER TYPE "OperationType_new" RENAME TO "OperationType";
DROP TYPE "OperationType_old";
COMMIT;
