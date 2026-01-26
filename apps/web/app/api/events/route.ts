/**
 * Events API
 * v0.17.0 - Community events system
 * v0.41.10 - C3 Step 11: DTO Consolidation Batch #3 (challenges, themed weeks, spotlights)
 * v0.41.6 - C3 Step 7: Unified API envelope
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';
import { buildSuccess, buildError, ApiErrorCode } from '@parel/api';
import type { EventDTO, EventsResponseDTO } from '@parel/types/dto';
import { z } from 'zod';
import { getRequestLocaleChain, sortByLocalePreference } from '@/lib/middleware/locale';

const EventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(1000),
  type: z.enum(['CHALLENGE', 'THEMED_WEEK', 'SPOTLIGHT', 'COMMUNITY']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  rewardXP: z.number().int().min(0).default(0),
  rewardDiamonds: z.number().int().min(0).default(0),
  imageUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * GET /api/events
 * Fetch active and upcoming events
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '20');

  // Build where clause
  const where: any = {};
  
  if (status) {
    where.status = status;
  } else {
    // By default, show active and upcoming events
    where.status = {
      in: ['ACTIVE', 'UPCOMING'],
    };
  }

  if (type) {
    where.type = type;
  }

  // Locale preference
  const chain = await getRequestLocaleChain(req);

  // Fetch events with locale filter
  const eventsRaw = await prisma.event.findMany({
    where: {
      ...where,
      OR: [
        { localeCode: { in: chain } },
        { localeCode: null },
      ],
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: [ { startDate: 'asc' }, { createdAt: 'desc' } ],
    take: limit,
  });

  const events = sortByLocalePreference(eventsRaw, chain);

  // Calculate time remaining for active events
  const now = new Date();
  const eventsWithTimeRemaining = events.map(event => {
    let timeRemaining: number | null = null;
    let timeUntilStart: number | null = null;

    if (event.status === 'ACTIVE') {
      timeRemaining = Math.max(0, event.endDate.getTime() - now.getTime());
    } else if (event.status === 'UPCOMING') {
      timeUntilStart = Math.max(0, event.startDate.getTime() - now.getTime());
    }

    return {
      ...event,
      timeRemaining,
      timeUntilStart,
    };
  });

  const response: EventsResponseDTO = {
    events: eventsWithTimeRemaining,
    localeChain: chain,
  };

  return buildSuccess(req, response);
});

/**
 * POST /api/events
 * Create a new event (Admin only)
 */
export const POST = safeAsync(async (req: NextRequest) => {
  // Get authenticated session
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return buildError(req, ApiErrorCode.AUTHENTICATION_ERROR, 'You must be logged in');
  }

  // Get user and verify admin role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user) {
    return buildError(req, ApiErrorCode.AUTHENTICATION_ERROR, 'User not found');
  }

  if (user.role !== 'ADMIN') {
    return buildError(req, ApiErrorCode.AUTHORIZATION_ERROR, 'Only admins can create events');
  }

  // Parse and validate request
  const body = await req.json();
  const validation = EventSchema.safeParse(body);

  if (!validation.success) {
    const details: Record<string, string[]> = {};
    validation.error.errors.forEach((err) => {
      const path = err.path.join('.') || 'root';
      if (!details[path]) details[path] = [];
      details[path].push(err.message);
    });
    return buildError(req, ApiErrorCode.VALIDATION_ERROR, validation.error.issues[0]?.message || 'Invalid event data', { details });
  }

  const data = validation.data;

  // Validate date logic
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (endDate <= startDate) {
    return buildError(req, ApiErrorCode.VALIDATION_ERROR, 'End date must be after start date');
  }

  // Check for overlapping events of the same type
  const overlappingEvents = await prisma.event.findMany({
    where: {
      type: data.type,
      status: {
        in: ['ACTIVE', 'UPCOMING'],
      },
      OR: [
        {
          AND: [
            { startDate: { lte: startDate } },
            { endDate: { gte: startDate } },
          ],
        },
        {
          AND: [
            { startDate: { lte: endDate } },
            { endDate: { gte: endDate } },
          ],
        },
        {
          AND: [
            { startDate: { gte: startDate } },
            { endDate: { lte: endDate } },
          ],
        },
      ],
    },
  });

  if (overlappingEvents.length > 0) {
    return buildError(req, ApiErrorCode.VALIDATION_ERROR, 'Event overlaps with existing event');
  }

  // Determine initial status based on dates
  const now = new Date();
  let status: 'DRAFT' | 'ACTIVE' | 'UPCOMING' | 'ENDED' = 'DRAFT';
  
  if (startDate <= now && endDate >= now) {
    status = 'ACTIVE';
  } else if (startDate > now) {
    status = 'UPCOMING';
  }

  // Create event
  const event = await prisma.event.create({
    data: {
      ...data,
      startDate,
      endDate,
      status,
      creatorId: user.id,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return buildSuccess(req, {
    message: 'Event created successfully',
    event,
  });
});

/**
 * PATCH /api/events
 * Update an event (Admin only)
 */
export const PATCH = safeAsync(async (req: NextRequest) => {
  // Get authenticated session
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return buildError(req, ApiErrorCode.AUTHENTICATION_ERROR, 'You must be logged in');
  }

  // Get user and verify admin role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return buildError(req, ApiErrorCode.AUTHORIZATION_ERROR, 'Only admins can update events');
  }

  // Parse request
  const body = await req.json();
  const { id, ...updateData } = body;

  if (!id) {
    return buildError(req, ApiErrorCode.VALIDATION_ERROR, 'Event ID is required');
  }

  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    return buildError(req, ApiErrorCode.NOT_FOUND, 'Event not found');
  }

  // Update event
  const updatedEvent = await prisma.event.update({
    where: { id },
    data: updateData,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return buildSuccess(req, {
    message: 'Event updated successfully',
    event: updatedEvent,
  });
});

/**
 * DELETE /api/events
 * Delete an event (Admin only)
 */
export const DELETE = safeAsync(async (req: NextRequest) => {
  // Get authenticated session
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return buildError(req, ApiErrorCode.AUTHENTICATION_ERROR, 'You must be logged in');
  }

  // Get user and verify admin role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return buildError(req, ApiErrorCode.AUTHORIZATION_ERROR, 'Only admins can delete events');
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return buildError(req, ApiErrorCode.VALIDATION_ERROR, 'Event ID is required');
  }

  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    return buildError(req, ApiErrorCode.NOT_FOUND, 'Event not found');
  }

  // Delete event (or mark as cancelled)
  await prisma.event.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  return buildSuccess(req, {
    message: 'Event cancelled successfully',
  });
});

