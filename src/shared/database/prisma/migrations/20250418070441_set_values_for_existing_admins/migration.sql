-- This is an empty migration.
UPDATE "User"
SET "adminStatus" = 'ACTIVE'
WHERE 'ADMIN' = ANY("roles") OR 'SUPERADMIN' = ANY("roles");