-- This is an empty migration.
INSERT INTO "Wallet" ("id", "userId", "balance", "lastUpdated", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(), -- Generates a UUID for the new wallet
    u.id,             -- User ID
    0,                -- Initial balance
    CURRENT_TIMESTAMP, -- lastUpdated
    CURRENT_TIMESTAMP, -- createdAt
    CURRENT_TIMESTAMP  -- updatedAt
FROM "User" u
LEFT JOIN "Wallet" w ON u.id = w."userId"
WHERE w.id IS NULL;   -- Only select users without a wallet