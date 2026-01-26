/**
 * Adventure Event Node API
 * v0.36.16 - Adventure Mode v0.1
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { advanceAdventure, getCurrentNode } from '@/lib/rpg/adventure';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * POST /api/adventure/event
 * Activate event from event node and advance
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Get current node
  const state = await getCurrentNode(user.id);

  if (!state || !state.currentNode || state.currentNode.type !== 'event') {
    return unauthorizedError('No event node available');
  }

  const eventData = state.currentNode.data;
  const eventCode = eventData.code;

  if (!eventCode) {
    return unauthorizedError('Event code not specified');
  }

  // Find event by code
  const event = await prisma.rpgEvent.findUnique({
    where: { code: eventCode },
  });

  if (!event) {
    logger.warn(`[Adventure] Event not found: ${eventCode}`);
    // Still advance even if event not found
  } else {
    // Activate event for 1 hour
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    await prisma.rpgEvent.update({
      where: { id: event.id },
      data: {
        startsAt: now,
        endsAt: oneHourLater,
        active: true,
      },
    });

    logger.info(`[Adventure] Activated event ${eventCode} for 1 hour`);
  }

  // Advance to next node
  const nextState = await advanceAdventure(user.id);

  return successResponse({
    event: event ? {
      code: event.code,
      name: event.name,
      description: event.description,
    } : null,
    nextState,
  });
});

