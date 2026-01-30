-- Update existing records to use new values
UPDATE "Subscription" SET "operationType" = 'SUBSCRIPTION' WHERE "operationType" = 'OPT_IN';
UPDATE "Subscription" SET "operationType" = 'UNSUBSCRIPTION' WHERE "operationType" = 'OPT_OUT';
UPDATE "Subscription" SET "operationType" = 'ONDEMAND' WHERE "operationType" = 'ONE_TIME';