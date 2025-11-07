import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, notFoundError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest, ctx: { params: { id: string } }) => {
  const { id } = ctx.params;
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email || null;

  const group = await prisma.group.findUnique({ where: { id } });
  if (!group) return notFoundError('Group not found');

  let isMember = false;
  if (userEmail) {
    const user = await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true } });
    if (user) {
      const member = await prisma.groupMember.findFirst({ where: { groupId: id, userId: user.id } });
      isMember = !!member;
    }
  }

  // Visibility: hidden/summary/full doesn't restrict stats access except hidden blocks reflections
  // However, for private groups and non-members, we still allow summary stats but no member identities.

  const members = await prisma.groupMember.findMany({ where: { groupId: id }, select: { userId: true } });
  const userIds = members.map((m) => m.userId);

  if (userIds.length === 0) {
    return NextResponse.json({ success: true, stats: { totalXP: 0, reflections: 0, avgLevel: 0, memberCount: 0 } });
  }

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { xp: true, level: true },
  });

  const totalXP = users.reduce((sum, u) => sum + (u.xp || 0), 0);
  const avgLevel = Math.round(users.reduce((sum, u) => sum + (u.level || 0), 0) / users.length);

  const reflections = await prisma.userReflection.count({ where: { userId: { in: userIds } } });

  return NextResponse.json({
    success: true,
    stats: {
      totalXP,
      reflections,
      avgLevel,
      memberCount: users.length,
      transparency: (group as any).transparency,
      visibility: (group as any).visibility,
      isMember,
    },
  });
});


