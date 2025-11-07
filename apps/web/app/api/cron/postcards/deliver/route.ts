import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

const AUTO_DELETE_DAYS = 30;

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  const now = new Date();

  // Deliver pending postcards
  const delivered = await prisma.postcard.updateMany({
    where: {
      status: 'pending',
      deliveryAt: { lte: now },
    },
    data: { status: 'delivered' },
  });

  // Auto-delete old postcards (30 days)
  const deleteBefore = new Date(now.getTime() - AUTO_DELETE_DAYS * 24 * 60 * 60 * 1000);
  const deleted = await prisma.postcard.updateMany({
    where: {
      status: { in: ['read', 'deleted'] },
      createdAt: { lte: deleteBefore },
    },
    data: { status: 'deleted' },
  });

  return NextResponse.json({
    success: true,
    delivered: delivered.count,
    deleted: deleted.count,
  });
});

