import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';
import { getCached, setCached } from '@/lib/cache/packCache';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || null;
  const cacheKey = `packs:list`;

  let packs = getCached<any[]>(cacheKey);
  if (!packs) {
    packs = await prisma.contentPack.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, key: true, title: true, description: true, category: true, price: true,
        premiumOnly: true, isActive: true, themeColor: true, icon: true, createdAt: true,
      },
    });
    setCached(cacheKey, packs);
  }

  let ownedIds: Set<string> = new Set();
  if (email) {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (user) {
      const ups = await prisma.userPack.findMany({ where: { userId: user.id }, select: { packId: true } });
      ownedIds = new Set(ups.map(u => u.packId));
    }
  }

  const data = packs.map(p => ({ ...p, owned: ownedIds.has(p.id) || p.price === 0 }));
  return NextResponse.json({ success: true, packs: data });
});


