import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { logEvent } from '@/lib/telemetry';
import { safeAsync, successResponse, validationError } from '@/lib/api-handler';

/**
 * POST /api/telemetry/client
 * Client-side telemetry endpoint
 */
export const POST = safeAsync(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    // Allow anonymous events for public pages
    return successResponse({});
  }

  const user = await (async () => {
    const { default: prisma } = await import('@/lib/db');
    return prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    });
  })();

  if (!user) {
    return successResponse({});
  }

  const body = await request.json();
  const { event, metadata } = body;

  if (!event) {
    return validationError('Event type required');
  }

  // Log the event (fire and forget to not block response)
  logEvent({
    userId: user.id,
    event,
    metadata,
  }).catch(() => {
    // Silently fail - telemetry not critical
  });

  return successResponse({});
});

