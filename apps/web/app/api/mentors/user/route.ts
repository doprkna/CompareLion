import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!me) return unauthorizedError('Unauthorized');

  const rel = await prisma.userMentor.findFirst({ where: { userId: me.id }, orderBy: { lastInteractionAt: 'desc' }, include: { mentor: true } });
  return NextResponse.json({ success: true, mentor: rel?.mentor || null, affinity: rel?.affinityScore || 0 });
});


