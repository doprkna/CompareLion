/**
 * Metrics API
 * Receives and stores analytics events
 * v0.13.2n - Community Growth (extended with growth metrics)
 */

import { NextRequest } from 'next/server';
import { safeAsync, successResponse } from '@/lib/api-handler';
import { logger } from '@/lib/utils/debug';
import { getFlags } from '@/lib/config/flags';
import { z } from 'zod';

const EventSchema = z.object({
  name: z.string(),
  timestamp: z.number(),
  data: z.record(z.any()),
});

const MetricsSchema = z.object({
  events: z.array(EventSchema),
});

// Growth events we're now tracking:
// - share_clicked (type: rank|challenge|achievement)
// - invite_generated (method: copy|email|twitter|etc)
// - challenge_completed (challengeId, type: daily|weekly)

/**
 * POST /api/metrics
 * Receive analytics events
 */
export const POST = safeAsync(async (req: NextRequest) => {
  // Check if analytics is enabled
  if (!getFlags().enableAnalytics) {
    return successResponse({ message: 'Analytics disabled' });
  }

  // Parse and validate request
  const body = await req.json();
  const validation = MetricsSchema.safeParse(body);

  if (!validation.success) {
    return successResponse({ message: 'Invalid metrics data' });
  }

  const { events } = validation.data;

  // Log events (in production, you would send to analytics service)
  for (const event of events) {
    logger.info('[METRICS]', {
      name: event.name,
      timestamp: new Date(event.timestamp).toISOString(),
      data: event.data,
    });
  }

  // Store in admin metrics (for internal dashboard)
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    }).catch(() => {
      // Silently fail if admin metrics endpoint is not available
    });
  } catch (e) {
    // Ignore errors
  }

  // TODO: Send to analytics service (e.g., PostHog, Mixpanel, etc.)
  // For now, we just log them

  return successResponse({
    received: events.length,
    timestamp: Date.now(),
  });
});

