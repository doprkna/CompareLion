/**
 * Admin Event API - Single Event Operations
 * v0.36.15 - Event System
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse, notFoundError, parseBody } from '@/lib/api-handler';
import { UserRole } from '@parel/db/client';

export const runtime = 'nodejs';

/**
 * PATCH /api/admin/events/[id]
 * Update event (partial update)
 */
export const PATCH = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return unauthorizedError('Admin access required');
  }

  const body = await parseBody<{
    active?: boolean;
    startsAt?: string;
    endsAt?: string;
  }>(req);

  const event = await prisma.rpgEvent.findUnique({
    where: { id: params.id },
  });

  if (!event) {
    return notFoundError('Event not found');
  }

  const updateData: any = {};
  if (body.active !== undefined) updateData.active = body.active;
  if (body.startsAt) updateData.startsAt = new Date(body.startsAt);
  if (body.endsAt) updateData.endsAt = new Date(body.endsAt);

  const updated = await prisma.rpgEvent.update({
    where: { id: params.id },
    data: updateData,
  });

  return successResponse({ event: updated });
});

/**
 * DELETE /api/admin/events/[id]
 * Delete event
 */
export const DELETE = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return unauthorizedError('Admin access required');
  }

  await prisma.rpgEvent.delete({
    where: { id: params.id },
  });

  return successResponse({ success: true });
});

