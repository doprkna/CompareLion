import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) return unauthorizedError('Invalid token');

  const weekAgo = new Date(Date.now() - 7*24*60*60*1000);
  const rels = await prisma.userMentor.findMany({ select: { id: true, userId: true, affinityScore: true } });
  let updated = 0;
  for (const r of rels) {
    const reflections = await prisma.userReflection.count({ where: { userId: r.userId, createdAt: { gte: weekAgo } } });
    const delta = reflections >= 7 ? 0.05 : reflections > 0 ? 0.02 : -0.03;
    await prisma.userMentor.update({ where: { id: r.id }, data: { affinityScore: Math.max(0, Math.min(1, r.affinityScore + delta)), lastInteractionAt: new Date() } });
    updated++;
  }
  return NextResponse.json({ success: true, updated });
});


