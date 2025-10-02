import { prisma } from '@parel/db/src/client';

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      theme: true,
      streakCount: true,
      // Count answered and skipped today
      _count: {
        select: {
          userQuestions: true,
        },
      },
      userQuestions: {
        where: {
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      },
    },
  });
}

export async function updateUserProfile(userId: string, data: any) {
  return prisma.user.update({ where: { id: userId }, data });
}
