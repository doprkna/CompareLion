import { PrismaClient } from '@prisma/client';

// Prevent multiple instances in development (Next.js hot reload)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Create or reuse Prisma client
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Logging configuration
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn']
      : ['error'],
  });

// Store in global to prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
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

export default prisma;