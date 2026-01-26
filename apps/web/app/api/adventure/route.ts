/**
 * Adventure API
 * v0.36.16 - Adventure Mode v0.1
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, successResponse, parseBody } from '@/lib/api-handler';
import { getCurrentNode, startAdventure, advanceAdventure, resetAdventure, getAllNodes } from '@/lib/rpg/adventure';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/adventure
 * Get current adventure state
 */
export const GET = safeAsync(async (req: NextRequest) => {
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

  const state = await getCurrentNode(user.id);
  const allNodes = await getAllNodes();

  return successResponse({
    state,
    allNodes,
  });
});

/**
 * POST /api/adventure/start
 * Start a new adventure run
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const body = await parseBody<{ action: 'start' | 'advance' | 'reset' }>(req);
  const action = body.action || 'start';

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  try {
    let state;
    
    if (action === 'start') {
      state = await startAdventure(user.id);
    } else if (action === 'advance') {
      state = await advanceAdventure(user.id);
    } else if (action === 'reset') {
      state = await resetAdventure(user.id);
    } else {
      return unauthorizedError('Invalid action');
    }

    const allNodes = await getAllNodes();

    return successResponse({
      state,
      allNodes,
    });
  } catch (error) {
    return unauthorizedError(
      error instanceof Error ? error.message : 'Failed to process adventure action'
    );
  }
}

