/**
 * Events Cleanup Job Handler (v0.29.21)
 * 
 * Clear expired events and shares
 */

import { prisma } from '@/lib/db';
import { deactivateExpiredEvents } from '@/lib/events';

export async function runEventsCleanup(): Promise<void> {
  // Deactivate expired global events
  await deactivateExpiredEvents();

  // Clean up expired share cards
  const now = new Date();
  await prisma.shareCard.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  });

  // Clean up expired firesides
  const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  await prisma.fireside.deleteMany({
    where: {
      isActive: false,
      expiresAt: { lte: cutoff },
    },
  });
}

