/**
 * @parel/db - Database Package Entry Point
 * 
 * Exports Prisma client with global singleton pattern
 * for Next.js compatibility and NextAuth adapter support
 */

import { PrismaClient } from "@prisma/client";

// Global singleton pattern to prevent multiple instances during Next.js hot reload
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Create or reuse Prisma client
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" 
      ? ["query", "error", "warn"] 
      : ["error"],
  });

// Store in global to prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown handlers
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });

  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

// Export as default (for NextAuth adapter)
export default prisma;

// Also export as named export (for backward compatibility)
export { prisma };

// Re-export Prisma types
export * from "@prisma/client";

