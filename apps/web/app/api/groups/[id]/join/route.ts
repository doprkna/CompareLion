import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest, ctx: { params: { id: string } }) => {
  const { id } = ctx.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return unauthorizedError('Unauthorized');

  const group = await prisma.group.findUnique({ where: { id } });
  if (!group) return notFoundError('Group not found');

  if ((group as any).visibility !== 'public') {
    return validationError('Private group requires invite');
  }

  const existing = await prisma.groupMember.findFirst({ where: { groupId: id, userId: user.id } });
  if (existing) {
    return NextResponse.json({ success: true, joined: true });
  }

  await prisma.groupMember.create({ data: { groupId: id, userId: user.id, role: 'member' } });
  return NextResponse.json({ success: true, joined: true });
});


