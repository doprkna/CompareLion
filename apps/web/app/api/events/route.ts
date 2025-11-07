/**
 * Events API
 * v0.17.0 - Community events system (challenges, themed weeks, spotlights)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, validationError, unauthorizedError, notFoundError } from '@/lib/api-handler';
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

  return successResponse({
    events: eventsWithTimeRemaining,
    localeChain: chain,
  });
});

/**
 * POST /api/events
 * Create a new event (Admin only)
 */
export const POST = safeAsync(async (req: NextRequest) => {
  // Get authenticated session
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in');
  }

  // Get user and verify admin role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  if (user.role !== 'ADMIN') {
    return unauthorizedError('Only admins can create events');
  }

  // Parse and validate request
  const body = await req.json();
  const validation = EventSchema.safeParse(body);

  if (!validation.success) {
    return validationError(
      validation.error.issues[0]?.message || 'Invalid event data'
    );
  }

  const data = validation.data;

  // Validate date logic
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (endDate <= startDate) {
    return validationError('End date must be after start date');
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
    return validationError(
      `Event overlaps with existing ${data.type} event: "${overlappingEvents[0]?.title}"`
    );
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

  return successResponse({
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
    return unauthorizedError('You must be logged in');
  }

  // Get user and verify admin role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return unauthorizedError('Only admins can update events');
  }

  // Parse request
  const body = await req.json();
  const { id, ...updateData } = body;

  if (!id) {
    return validationError('Event ID is required');
  }

  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    return notFoundError('Event not found');
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

  return successResponse({
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
    return unauthorizedError('You must be logged in');
  }

  // Get user and verify admin role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return unauthorizedError('Only admins can delete events');
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return validationError('Event ID is required');
  }

  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    return notFoundError('Event not found');
  }

  // Delete event (or mark as cancelled)
  await prisma.event.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  return successResponse({
    message: 'Event cancelled successfully',
  });
});

