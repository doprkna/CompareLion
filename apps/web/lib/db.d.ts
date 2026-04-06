/**
 * Database Client Re-export
 *
 * Lazy singleton: no PrismaClient created and no throw at module load.
 * Use getPrisma() in request handlers; it throws only when called without DATABASE_URL.
 *
 * v0.35.17b - Centralized env loader with safe fallbacks
 */
import { PrismaClient } from '@parel/db/client';
/**
 * Returns Prisma client singleton. Call only inside request handlers.
 * Returns null when DATABASE_URL is missing (build-safe); throws only when
 * callers require a client (e.g. getPrismaOrThrow). Route handlers should
 * check for null and return 503.
 */
export declare function getPrisma(): PrismaClient | null;
export declare const prisma: PrismaClient;
export default prisma;
