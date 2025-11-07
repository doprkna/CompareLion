import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, notFoundError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest, ctx: { params: { id: string } }) => {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || null;
  const { id } = ctx.params;

  const pack = await prisma.contentPack.findUnique({ where: { id } });
  if (!pack || !pack.isActive) return notFoundError('Pack not found');

  let userId: string | null = null;
  if (email) {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    userId = user?.id ?? null;
  }

  let owned = false;
  if (userId) {
    const rel = await prisma.userPack.findFirst({ where: { userId, packId: id } });
    owned = !!rel || pack.price === 0;
  }

  const items = owned
    ? await prisma.packItem.findMany({ where: { packId: id }, orderBy: { createdAt: 'asc' } })
    : [];

  return NextResponse.json({ success: true, pack: { ...pack, owned, items } });
});


