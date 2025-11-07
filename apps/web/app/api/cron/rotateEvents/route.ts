import { NextRequest, NextResponse } from 'next/server';
import { safeAsync } from '@/lib/api-handler';
import { preloadWildcardsNextDays } from '@/lib/events/wildcardLoader';

// GET /api/cron/rotateEvents - preload next 7 days into in-memory cache
export const GET = safeAsync(async (_req: NextRequest) => {
  preloadWildcardsNextDays(7);
  const res = NextResponse.json({ success: true, preloadedDays: 7, timestamp: new Date().toISOString() });
  res.headers.set('Cache-Control', 'no-store');
  return res;
});


