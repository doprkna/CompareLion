import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export { prisma };
export type { Prisma } from '@prisma/client';
