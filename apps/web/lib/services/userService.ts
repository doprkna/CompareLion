import { prisma } from '@parel/db/src/client';

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function updateUserProfile(userId: string, data: any) {
  return prisma.user.update({ where: { id: userId }, data });
}
