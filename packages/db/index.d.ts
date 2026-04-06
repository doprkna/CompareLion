/**
 * @parel/db - Database Package Entry Point
 * Re-exports from client (single PrismaClient + ensureDatabaseUrl).
 */
export { prisma as default, prisma } from './src/client';
export * from '@prisma/client';
