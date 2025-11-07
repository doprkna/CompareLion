import { NextRequest, NextResponse } from 'next/server';
import { safeAsync, validationError, unauthorizedError } from '@/lib/api-handler';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;
let redis: Redis | null = null;
try { if (REDIS_URL) redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 3, lazyConnect: true }); } catch { redis = null; }

function invalidateToday(region: string) {
  if (!redis) return;
  try { redis.del(`event:today:${region.toUpperCase()}`); } catch {}
}

export const POST = safeAsync(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (!(auth as any).user && !(auth as any).error) return auth as NextResponse;
  const userId = (auth as any).user?.id as string | undefined;
  if (!userId) return unauthorizedError('Unauthorized');

  const body = await req.json();
  const eventId = (body?.eventId || '').trim();
  const action = (body?.action || '').trim();
  if (!eventId || action !== 'join') return validationError('Invalid payload');

  const ev = await prisma.miniEvent.findUnique({ where: { id: eventId }, select: { id: true, region: true, isActive: true, date: true } });
  if (!ev || !ev.isActive) return validationError('Event not active');

  const todayStart = new Date(); todayStart.setUTCHours(0,0,0,0);
  const todayEnd = new Date(); todayEnd.setUTCHours(23,59,59,999);
  if (ev.date < todayStart || ev.date > todayEnd) return validationError('Event expired');

  // upsert participation to avoid duplicates
  const existing = await prisma.miniEventParticipation.findFirst({ where: { userId, eventId } });
  let record;
  if (existing) {
    record = await prisma.miniEventParticipation.update({ where: { id: existing.id }, data: { status: 'joined' } });
  } else {
    record = await prisma.miniEventParticipation.create({ data: { userId, eventId, status: 'joined' } });
  }

  invalidateToday(ev.region);

  return NextResponse.json({ success: true, participation: { id: record.id }, timestamp: new Date().toISOString() }, { status: 201 });
});


