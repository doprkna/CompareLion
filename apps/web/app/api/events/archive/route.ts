import { NextRequest, NextResponse } from 'next/server';
import { safeAsync } from '@/lib/api-handler';
import { prisma } from '@/lib/db';

export const GET = safeAsync(async (req: NextRequest) => {
  const days = Math.min(parseInt(req.nextUrl.searchParams.get('days') || '7', 10), 30);
  const region = (req.nextUrl.searchParams.get('region') || '').toUpperCase();

  const end = new Date(); end.setUTCHours(23,59,59,999);
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - (days - 1)); start.setUTCHours(0,0,0,0);

  const where: any = { date: { gte: start, lte: end } };
  if (region) where.region = region;

  const events = await prisma.miniEvent.findMany({
    where,
    orderBy: { date: 'desc' },
    select: { id: true, date: true, region: true, title: true, rewardText: true, tags: true },
  });

  return NextResponse.json({ success: true, events, count: events.length, range: { start, end }, timestamp: new Date().toISOString() });
});









