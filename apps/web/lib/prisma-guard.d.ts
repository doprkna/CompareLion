/**
 * Prisma Client Guard
 *
 * Ensures Prisma client is available before operations.
 * Provides better error messages for debugging.
 */
/**
 * Verify Prisma client is initialized
 * Throws descriptive error if not available
 */
export declare function ensurePrismaClient(): any;
/**
 * Execute a Prisma query with error handling
 * @param operation - Name of the operation for logging
 * @param query - Async function that performs the Prisma query
 */
export declare function safePrismaQuery<T>(operation: string, query: () => Promise<T>): Promise<T>;
/**
 * Check if a specific Prisma model is available
 */
export declare function checkPrismaModel(modelName: string): boolean;
