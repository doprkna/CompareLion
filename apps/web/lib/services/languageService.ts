import { prisma } from '@parel/db/src/client';

export async function getAllLanguages() {
  return prisma.language.findMany();
}
