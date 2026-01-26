/**
 * RPG Events API
 * v0.36.15 - Event System
 */

import { NextRequest } from 'next/server';
import { safeAsync, successResponse } from '@/lib/api-handler';
import { getActiveEvents } from '@/lib/rpg/eventEngine';

export const runtime = 'nodejs';

/**
 * GET /api/rpg/events
 * Returns all currently active events
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const events = await getActiveEvents();
  
  return successResponse({
    events: events.map(event => ({
      id: event.id,
      code: event.code,
      name: event.name,
      description: event.description,
      effect: event.effect,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt.toISOString(),
    })),
  });
});

