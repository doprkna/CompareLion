/**
 * Current Events API
 * GET /api/events/current - Get currently active events
 * v0.36.41 - Events System 1.0
 */

import { NextRequest } from 'next/server';
import { safeAsync, successResponse } from '@/lib/api-handler';
import { getCurrentActiveEvents } from '@/lib/events/eventEngine';
import { isEventActive, getEventTimeRemaining } from '@/lib/events/types';

export const runtime = 'nodejs';

/**
 * GET /api/events/current
 * Returns all currently active events
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const events = await getCurrentActiveEvents();

  const formattedEvents = events.map(event => {
    const timeRemaining = getEventTimeRemaining(event);

    return {
      id: event.id,
      name: event.name,
      description: event.description,
      type: event.type,
      startAt: event.startAt.toISOString(),
      endAt: event.endAt.toISOString(),
      icon: event.icon,
      emoji: event.emoji,
      effects: event.effects.map(effect => ({
        id: effect.id,
        effectType: effect.effectType,
        value: effect.value,
        target: effect.target,
        description: effect.description,
      })),
      timeRemaining,
      isActive: isEventActive(event),
    };
  });

  return successResponse({
    events: formattedEvents,
    totalEvents: formattedEvents.length,
  });
});

