import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, notFoundError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest, ctx: { params: { id: string } }) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!me) return unauthorizedError('Unauthorized');

  const fs = await prisma.fireside.findUnique({ where: { id: ctx.params.id } });
  if (!fs) return notFoundError('Not found');
  if (fs.creatorId !== me.id && !(fs.participantIds || []).includes(me.id)) return unauthorizedError('Access denied'); // sanity-fix

  const reactions = await prisma.firesideReaction.findMany({ where: { firesideId: fs.id }, orderBy: { createdAt: 'desc' }, take: 200 });
  return NextResponse.json({ success: true, fireside: fs, reactions });
});


