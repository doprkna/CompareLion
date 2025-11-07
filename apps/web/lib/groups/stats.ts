import { prisma } from '@/lib/db';

export async function recomputeGroupStats(groupId: string) {
  const members = await prisma.groupMember.findMany({ where: { groupId }, select: { userId: true } });
  const userIds = members.map((m) => m.userId);

  const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { xp: true, level: true } });
  const totalXP = users.reduce((sum, u) => sum + (u.xp || 0), 0);
  const avgLevel = users.length ? Math.round(users.reduce((s, u) => s + (u.level || 0), 0) / users.length) : 0;
  const reflections = await prisma.userReflection.count({ where: { userId: { in: userIds } } });

  const stat = await prisma.groupStat.create({
    data: {
      groupId,
      totalXP,
      reflections,
      avgLevel,
    },
  });

  return stat;
}


