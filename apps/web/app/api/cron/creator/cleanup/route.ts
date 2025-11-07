/**
 * Creator Cleanup Cron (v0.29.27)
 * 
 * POST /api/cron/creator/cleanup
 * Disables old or low-rated packs
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { prisma } from '@/lib/db';

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000); // 6 months
  const thresholdDownloads = 5; // Minimum downloads to stay active

  // Disable old published packs (older than 6 months with low downloads)
  const disabledOld = await prisma.creatorPack.updateMany({
    where: {
      status: 'APPROVED',
      publishedAt: { not: null, lt: sixMonthsAgo },
      downloadsCount: { lt: thresholdDownloads },
    },
    data: {
      status: 'REJECTED', // Mark as rejected (deactivated)
    },
  });

  // Disable packs with very low downloads (less than threshold)
  const disabledLow = await prisma.creatorPack.updateMany({
    where: {
      status: 'APPROVED',
      publishedAt: { not: null },
      downloadsCount: { lt: thresholdDownloads },
      createdAt: { lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }, // At least 1 month old
    },
    data: {
      status: 'REJECTED',
    },
  });

  // Count active published packs
  const activeCount = await prisma.creatorPack.count({
    where: {
      status: 'APPROVED',
      publishedAt: { not: null },
    },
  });

  return successResponse({
    success: true,
    disabled: {
      old: disabledOld.count,
      lowDownloads: disabledLow.count,
      total: disabledOld.count + disabledLow.count,
    },
    activeCount,
    message: `Cleanup complete: ${disabledOld.count + disabledLow.count} packs disabled, ${activeCount} remain active`,
  });
});

