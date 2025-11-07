/**
 * Database Client Re-export
 * 
 * This file re-exports the Prisma client for use in the web app.
 * It ensures we always get a valid PrismaClient instance.
 * 
 * Handles missing DATABASE_URL gracefully during build time.
 */

import { PrismaClient } from '@parel/db/client';
import { logger } from '@/lib/logger';

// Global singleton pattern
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient | null };

// Create client only if DATABASE_URL is available
let prismaClient: PrismaClient | null = null;

if (process.env.DATABASE_URL) {
  prismaClient = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClient;
  }
} else {
  if (process.env.NODE_ENV === 'development') {
    logger.warn('[DB] DATABASE_URL not set - Prisma client not initialized (build-time mode)');
  }
  prismaClient = null;
}

export const prisma = prismaClient as PrismaClient;
export default prisma;
