/**
 * Database Client Re-export
 * 
 * This file re-exports the Prisma client for use in the web app.
 * Safe singleton pattern to ensure Prisma initializes exactly once.
 * 
 * v0.35.17b - Centralized env loader with safe fallbacks
 */

import { PrismaClient } from '@parel/db/client';
import { env, hasDb } from '@/lib/env';

// Global singleton pattern (Vercel-safe)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let _prisma: PrismaClient | null = null;

function getPrisma(): PrismaClient | null {
  if (!hasDb) {
    return null;
  }
  
  if (!_prisma) {
    _prisma = globalForPrisma.prisma ??
      new PrismaClient({
        datasourceUrl: env.DATABASE_URL,
        log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    
    // Prevent multiple instances in development
    if (typeof process !== 'undefined' && env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = _prisma;
    }
  }
  return _prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    if (!client) {
      throw new Error("Prisma client not available - DATABASE_URL not configured");
    }
    return (client as any)[prop];
  },
  set(_target, prop, value) {
    const client = getPrisma();
    if (!client) {
      throw new Error("Prisma client not available - DATABASE_URL not configured");
    }
    (client as any)[prop] = value;
    return true;
  }
});

export default prisma;
