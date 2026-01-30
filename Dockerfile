FROM node:20.12.2-alpine as base

WORKDIR /usr/src/app
RUN apk add --no-cache openssl3

COPY package.json yarn.lock ./

# Install dependencies
FROM base AS prod-deps 
RUN yarn install --production --frozen-lockfile

# Build stage
FROM base AS build
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
RUN yarn global add prisma-generator-nestjs-dto

# Copy all source files
COPY . .
# Generate Prisma client first
RUN yarn prisma generate --schema=src/shared/database/prisma/schema.prisma
# Then build the application
RUN yarn run build

FROM base AS production
# Set environment variables
ENV NODE_ENV=production 
WORKDIR /usr/src/app
# Copy package files
COPY package.json yarn.lock ./
# Copy dependencies
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
# Copy Prisma files and generated client
COPY --from=build /usr/src/app/src/shared/database/prisma ./src/shared/database/prisma
# Copy built application
COPY --from=build /usr/src/app/dist/src ./dist
COPY --from=build /usr/src/app/tsconfig.json ./tsconfig.json
# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN chown -R node:node /usr/src/app && \
    chown node:node /entrypoint.sh
# Set user
USER node
# Expose port
EXPOSE 4000
# Entrypoint script
ENTRYPOINT ["/entrypoint.sh"]
# Start production server
CMD ["yarn", "start:prod"]