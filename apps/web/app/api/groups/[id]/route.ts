import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, notFoundError } from '@/lib/api-handler';

function canViewGroupDetails(group: any, isMember: boolean) {
  if (group.visibility === 'public') return true;
  return isMember; // private requires membership
}

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

  if (!canViewGroupDetails(group as any, isMember)) {
    return unauthorizedError('Private group');
  }

  const memberCount = await prisma.groupMember.count({ where: { groupId: id } });
  const owner = group.ownerId
    ? await prisma.user.findUnique({ where: { id: group.ownerId }, select: { id: true, name: true, username: true } })
    : null;

  return NextResponse.json({
    success: true,
    group: {
      id: group.id,
      name: group.name,
      description: (group as any).description ?? null,
      visibility: (group as any).visibility,
      transparency: (group as any).transparency,
      memberCount,
      owner,
      createdAt: (group as any).createdAt,
    },
  });
});


