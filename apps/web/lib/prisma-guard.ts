/**
 * Prisma Client Guard
 * 
 * Ensures Prisma client is available before operations.
 * Provides better error messages for debugging.
 */

import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * Verify Prisma client is initialized
 * Throws descriptive error if not available
 */
export function ensurePrismaClient() {
  if (!prisma) {
    throw new Error("Prisma client not initialized - database may not be available");
  }
  return prisma;
}

/**
 * Execute a Prisma query with error handling
 * @param operation - Name of the operation for logging
 * @param query - Async function that performs the Prisma query
 */
export async function safePrismaQuery<T>(
  operation: string,
  query: () => Promise<T>
): Promise<T> {
  try {
    ensurePrismaClient();
    return await query();
  } catch (error: any) {
    logger.error(`[Prisma Error] ${operation}`, error.message || error);
    throw error;
  }
}

/**
 * Check if a specific Prisma model is available
 */
export function checkPrismaModel(modelName: string): boolean {
  try {
    const client = ensurePrismaClient();
    return modelName in client;
  } catch {
    return false;
  }
}
















