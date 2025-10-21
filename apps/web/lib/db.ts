/**
 * Database Client Re-export
 * 
 * This file re-exports the Prisma client for use in the web app.
 * It ensures we always get a valid PrismaClient instance.
 */

import { PrismaClient } from '@prisma/client';

// Global singleton pattern
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
