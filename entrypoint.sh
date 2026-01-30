#!/bin/sh
set -e

export PATH="$PATH:/usr/src/app/node_modules/.bin:/usr/local/share/.config/yarn/global/node_modules/.bin"

echo "→ Initializing application..."
echo "→ Generating Prisma Client..."
yarn run schema:generate --schema=src/shared/database/prisma/schema.prisma

echo "→ Running database migrations..."
yarn run migrate:deploy --schema=src/shared/database/prisma/schema.prisma

echo "→ Starting the application..."
exec "$@"