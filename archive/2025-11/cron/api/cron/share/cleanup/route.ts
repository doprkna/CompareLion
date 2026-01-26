import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

/**
 * POST /api/cron/share/cleanup
 * Removes expired share cards
 * Cron/admin only
 * v0.29.15 - Share Cards
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  const now = new Date();

  // Delete expired share cards
  const deleted = await prisma.shareCard.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  });

  return successResponse({
    success: true,
    deleted: deleted.count,
    message: `Deleted ${deleted.count} expired share cards`,
  });
});

