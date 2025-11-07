import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return unauthorizedError('Unauthorized');

  const list = await prisma.affinity.findMany({
    where: { OR: [{ sourceId: user.id }, { targetId: user.id }] },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ success: true, affinities: list });
});


