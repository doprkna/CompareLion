import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, notFoundError, forbiddenError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest, ctx: { params: { id: string } }) => {
  const { id } = ctx.params;
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email || null;

  const group = await prisma.group.findUnique({ where: { id } });
  if (!group) return notFoundError('Group not found');

  let userId: string | null = null;
  if (userEmail) {
    const u = await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true } });
    userId = u?.id || null;
  }

  const isMember = userId
    ? !!(await prisma.groupMember.findFirst({ where: { groupId: id, userId } }))
    : false;

  const transparency = (group as any).transparency as 'summary' | 'full' | 'hidden';
  const visibility = (group as any).visibility as 'private' | 'public';

  if (transparency === 'hidden') {
    return forbiddenError('Reflections are hidden for this group');
  }

  if (visibility === 'private' && !isMember) {
    return unauthorizedError('Private group');
  }

  const members = await prisma.groupMember.findMany({ where: { groupId: id }, select: { userId: true } });
  const userIds = members.map((m) => m.userId);

  if (transparency === 'summary') {
    const count = await prisma.userReflection.count({ where: { userId: { in: userIds } } });
    return NextResponse.json({ success: true, reflections: { count } });
  }

  // full
  const reflections = await prisma.userReflection.findMany({
    where: { userId: { in: userIds } },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      userId: true,
      content: true,
      summary: true,
      sentiment: true,
      createdAt: true,
      user: { select: { id: true, name: true, username: true } },
    },
  });

  return NextResponse.json({ success: true, reflections });
});


