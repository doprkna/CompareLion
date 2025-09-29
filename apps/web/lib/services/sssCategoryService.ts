import { prisma } from '@parel/db/src/client';
import type { Prisma } from '@prisma/client';

export async function getAllSssCategories(filters?: Prisma.SssCategoryWhereInput) {
  return prisma.sssCategory.findMany({ where: filters });
}

export async function createSssCategory(data: Prisma.SssCategoryCreateInput) {
  return prisma.sssCategory.create({ data });
}
