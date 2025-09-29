import { prisma } from '@parel/db/src/client';

export async function getLatestVersion() {
  return prisma.version.findFirst({ orderBy: { createdAt: 'desc' } });
}
