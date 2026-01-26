import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@parel/db/src/client';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const total = await prisma.sssCategory.count();
  const done = await prisma.sssCategory.count({ where: { status: 'done' } });
  const pending = await prisma.sssCategory.count({ where: { status: 'pending' } });

  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  // Average per day over last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const generatedLastWeek = await prisma.sssCategory.count({
    where: { status: 'done', generatedAt: { gte: sevenDaysAgo } }
  });
  const avgPerDay = generatedLastWeek / 7;

  const etaDays = avgPerDay > 0 ? Math.ceil(pending / avgPerDay) : null;

  return NextResponse.json({ total, done, pending, percent, avgPerDay, etaDays });
}
