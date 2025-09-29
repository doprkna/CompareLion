FROM node:20-alpine

WORKDIR /app

# Copy package manager files
COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install

# Copy Prisma schema (from apps/web/prisma)
COPY packages/db/ ./prisma

# Generate prisma client
RUN npx prisma generate
