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

  // Unlocked + free active packs
  const unlocked = await prisma.userPack.findMany({ where: { userId: user.id }, select: { packId: true } });
  const freePacks = await prisma.contentPack.findMany({ where: { isActive: true, price: 0 }, select: { id: true } });
  const packIds = Array.from(new Set([ ...unlocked.map(u => u.packId), ...freePacks.map(p => p.id) ]));

  const items = await prisma.packItem.findMany({ where: { packId: { in: packIds } } });

  const aggregated = {
    questions: items.filter(i => i.type === 'question'),
    reflections: items.filter(i => i.type === 'reflection'),
    challenges: items.filter(i => i.type === 'challenge'),
    badges: items.filter(i => i.type === 'badge'),
    themes: items.filter(i => i.type === 'theme'),
  };

  return NextResponse.json({ success: true, content: aggregated });
});


