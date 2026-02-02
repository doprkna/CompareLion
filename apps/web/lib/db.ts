/**
 * Database Client Re-export
 *
 * Lazy singleton: no PrismaClient created and no throw at module load.
 * Use getPrisma() in request handlers; it throws only when called without DATABASE_URL.
 *
 * v0.35.17b - Centralized env loader with safe fallbacks
 */

import { PrismaClient } from '@parel/db/client';
import { env, hasDb } from '@/lib/env';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
let _prisma: PrismaClient | null = null;

/**
 * Returns Prisma client singleton. Call only inside request handlers.
 * Returns null when DATABASE_URL is missing (build-safe); throws only when
 * callers require a client (e.g. getPrismaOrThrow). Route handlers should
 * check for null and return 503.
 */
export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  if (!_prisma) {
    _prisma =
      globalForPrisma.prisma ??
      new PrismaClient({
        datasourceUrl: env.DATABASE_URL,
        log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    if (typeof process !== 'undefined' && env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = _prisma;
    }
  }
  return _prisma;
}

/** Lazy proxy: no PrismaClient at import; defers to getPrisma() on use. When DATABASE_URL missing, returns stub that throws on any method call (build-safe). */
const stubThrow = () => {
  throw new Error('Prisma client not available - DATABASE_URL not configured');
};
function stubDelegate(): unknown {
  return new Proxy(stubThrow, {
    get: () => stubThrow,
  });
}
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    if (!client) return stubDelegate();
    return (client as Record<string, unknown>)[prop as string];
  },
  set(_target, prop, value) {
    const client = getPrisma();
    if (!client) return true;
    (client as Record<string, unknown>)[prop as string] = value;
    return true;
  },
});

export default prisma;
