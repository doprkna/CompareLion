/**
 * Market Refresh Job Handler (v0.29.21)
 * 
 * Rotate event shop items weekly
 */

import { prisma } from '@/lib/db';

export async function runMarketRefresh(): Promise<void> {
  // For MVP, just log refresh
  // Future: Check active season/event and update isEventItem status

  // Get all event items (for monitoring/debugging)
  await prisma.marketItem.findMany({
    where: {
      isEventItem: true,
    },
    select: {
      id: true,
      name: true,
    },
  });

  // Future: Implement event item rotation logic (tied to season cron)
}

