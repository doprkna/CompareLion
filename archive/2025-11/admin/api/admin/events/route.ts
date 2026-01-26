/**
 * Admin Events API
 * GET /api/admin/events - List all events
 * POST /api/admin/events - Create a new event
 * v0.36.41 - Events System 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { CreateEventSchema, UpdateEventSchema } from '@/lib/events/schemas';

export const runtime = 'nodejs';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
}

/**
 * GET /api/admin/events
 * List all events
 */
export const GET = safeAsync(async (req: NextRequest) => {
  await requireAdmin();

  const events = await prisma.event.findMany({
    include: {
      effects: true,
    },
    orderBy: [
      { startAt: 'desc' },
      { name: 'asc' },
    ],
  });

  return successResponse({
    events: events.map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      type: event.type,
      startAt: event.startAt.toISOString(),
      endAt: event.endAt.toISOString(),
      active: event.active,
      icon: event.icon,
      emoji: event.emoji,
      effects: event.effects.map(effect => ({
        id: effect.id,
        effectType: effect.effectType,
        value: effect.value,
        target: effect.target,
        description: effect.description,
      })),
      createdAt: event.createdAt.toISOString(),
    })),
    totalEvents: events.length,
  });
});

/**
 * POST /api/admin/events
 * Create a new event
 */
export const POST = safeAsync(async (req: NextRequest) => {
  await requireAdmin();

  const body = await parseBody(req);
  const validation = CreateEventSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid event data', validation.error.issues);
  }

  const { name, description, type, startAt, endAt, icon, emoji } = validation.data;

  try {
    const startDate = typeof startAt === 'string' ? new Date(startAt) : startAt;
    const endDate = typeof endAt === 'string' ? new Date(endAt) : endAt;

    const event = await prisma.event.create({
      data: {
        name,
        description,
        type,
        startAt: startDate,
        endAt: endDate,
        active: false, // Events are inactive by default
        icon,
        emoji,
      },
    });

    return successResponse({
      event: {
        id: event.id,
        name: event.name,
        description: event.description,
        type: event.type,
        startAt: event.startAt.toISOString(),
        endAt: event.endAt.toISOString(),
        active: event.active,
        icon: event.icon,
        emoji: event.emoji,
      },
    });
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : 'Failed to create event'
    );
  }
});
