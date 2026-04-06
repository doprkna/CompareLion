import { prisma } from '@parel/db/client';

export async function getAllLanguages() {
  return prisma.language.findMany();
}
