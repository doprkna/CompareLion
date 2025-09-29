import { prisma } from '@parel/db/src/client';
// Service functions for SssCategory operations
export async function getAllSssCategories(filters?: any) {
  // @ts-ignore: bypass missing sssCategory on Prisma client until generated
  return (prisma as any).sssCategory.findMany({ where: filters });
}

export async function createSssCategory(data: any) {
  // @ts-ignore: bypass missing sssCategory on Prisma client until generated
  return (prisma as any).sssCategory.create({ data });
}
