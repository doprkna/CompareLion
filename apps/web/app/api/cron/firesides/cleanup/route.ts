import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  const now = new Date();
  // Mark overdue as inactive
  const inactivated = await prisma.fireside.updateMany({ where: { isActive: true, expiresAt: { lte: now } }, data: { isActive: false } });
  // Optionally delete records older than 3 days beyond expiry
  const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const removed = await prisma.fireside.deleteMany({ where: { isActive: false, expiresAt: { lte: cutoff } } });

  return NextResponse.json({ success: true, inactivated: inactivated.count, removed: removed.count });
});


