/**
 * Database Client Re-export
 * 
 * This file re-exports the Prisma client for use in the web app.
 * Safe singleton pattern to ensure Prisma initializes exactly once.
 * 
 * v0.35.16d - Vercel build safety: guaranteed single instance + DATABASE_URL fallback
 */

import { PrismaClient } from '@parel/db/client';

// DATABASE_URL fallback for Vercel build stage (v0.35.16d)
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL missing – using dummy fallback for build');
  process.env.DATABASE_URL = 'file:./dev.db';
}

// Global singleton pattern (Vercel-safe)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
