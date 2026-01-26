/**
 * Admin Activate Event API
 * POST /api/admin/events/activate - Activate an event
 * v0.36.41 - Events System 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody, notFoundError } from '@/lib/api-handler';
import { activateEvent } from '@/lib/events/eventEngine';
import { ActivateEventSchema } from '@/lib/events/schemas';

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
 * POST /api/admin/events/activate
 * Activate an event
 */
export const POST = safeAsync(async (req: NextRequest) => {
  await requireAdmin();

  const body = await parseBody(req);
  const validation = ActivateEventSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data', validation.error.issues);
  }

  const { eventId } = validation.data;

  const result = await activateEvent(eventId);

  if (!result.success) {
    return validationError(result.error || 'Failed to activate event');
  }

  return successResponse({
    success: true,
    message: 'Event activated successfully',
  });
});

