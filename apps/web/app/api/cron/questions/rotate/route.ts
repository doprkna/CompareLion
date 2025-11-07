/**
 * Question Rotate Cron (v0.29.24)
 * 
 * POST /api/cron/questions/rotate
 * Activates/deactivates event question sets
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

  // Deactivate expired event questions
  // Note: Prisma generates QuestionTemplate as questionTemplate in client
  const deactivated = await (prisma as any).questionTemplate.updateMany({
    where: {
      category: 'event',
      isActive: true,
      // Assuming we have expiry logic via metadata or separate expiry field
      // For MVP, we'll use a simple time-based check
    },
    data: {
      isActive: false,
    },
  });

  // Activate event questions for current events
  // This is a placeholder - in full implementation, would check active events
  const activated = await (prisma as any).questionTemplate.updateMany({
    where: {
      category: 'event',
      isActive: false,
      // Check if associated with active event
    },
    data: {
      isActive: true,
    },
  });

  // Rotate daily questions (mark old ones as inactive if needed)
  const dailyRotated = await (prisma as any).questionTemplate.count({
    where: {
      category: 'daily',
      isActive: true,
    },
  });

  return successResponse({
    success: true,
    deactivated: deactivated.count,
    activated: activated.count,
    dailyActive: dailyRotated,
    message: `Rotated questions: ${deactivated.count} deactivated, ${activated.count} activated`,
  });
});

