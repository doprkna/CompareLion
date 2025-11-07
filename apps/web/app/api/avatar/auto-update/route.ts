import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!me) return unauthorizedError('Unauthorized');

  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await prisma.userReflection.findMany({ where: { userId: me.id, createdAt: { gte: since } }, select: { sentiment: true }, take: 20, orderBy: { createdAt: 'desc' } });
  let score = 0;
  for (const r of recent) {
    if ((r.sentiment || '').toLowerCase().includes('positive')) score += 0.2;
    else if ((r.sentiment || '').toLowerCase().includes('negative')) score -= 0.2;
  }
  if (score > 1) score = 1; if (score < -1) score = -1;
  let mood = 'neutral'; let pose = 'default';
  if (score > 0.4) { mood = 'excited'; pose = 'celebrating'; }
  else if (score > 0.1) { mood = 'happy'; pose = 'default'; }
  else if (score < -0.4) { mood = 'tired'; pose = 'resting'; }
  else if (score < -0.1) { mood = 'sad'; pose = 'resting'; }
  else { mood = 'focused'; pose = 'thinking'; }

  const entry = await prisma.avatarMood.create({ data: { userId: me.id, mood, pose, emotionScore: score, source: 'auto' } });
  return NextResponse.json({ success: true, mood: entry });
});


