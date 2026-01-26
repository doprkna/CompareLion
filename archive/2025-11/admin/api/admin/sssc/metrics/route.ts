import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@parel/db/src/client';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const total = await prisma.sssCategory.count();
  const completed = await prisma.sssCategory.count({ where: { status: 'done' } });
  const pending = await prisma.sssCategory.count({ where: { status: 'pending' } });
  const completedPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Compute average per day over last week
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const doneLastWeek = await prisma.sssCategory.count({ where: { status: 'done', generatedAt: { gte: weekAgo } } });
  const avgPerDay = doneLastWeek / 7;
  const etaDays = avgPerDay > 0 ? Math.ceil(pending / avgPerDay) : null;

  return NextResponse.json({ total, completedPercent, pending, avgPerDay, etaDays });
}
