import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/db';
import { logEvent } from '@/lib/telemetry';
import { safeAsync, successResponse, unauthorizedError, notFoundError, validationError } from '@/lib/api-handler';
import { logger } from '@parel/core/utils/debug';

/**
 * POST /api/onboarding/complete
 * Complete user onboarding and save profile
 */
export const POST = safeAsync(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const body = await request.json();
  const { username, avatar, archetype } = body;

  // Validate inputs
  if (!username || username.length < 3 || username.length > 20) {
    return validationError('Username must be 3-20 characters');
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return validationError('Username can only contain letters, numbers, and underscores');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return notFoundError('User');
  }

  // Check if username is taken (if different from current)
  if (user.username !== username) {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return validationError('Username already taken');
    }
  }

    // Update user with onboarding data
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username,
        avatarUrl: avatar,
        archetype,
        // Mark onboarding as complete by updating profile
        userProfile: {
          upsert: {
            create: {
              onboardingCompletedAt: new Date(),
            },
            update: {
              onboardingCompletedAt: new Date(),
            },
          },
        },
      },
      include: {
        userProfile: true,
      },
    });

  // Log telemetry event
  await logEvent({
    userId: user.id,
    event: 'onboarding_completed',
    metadata: {
      username,
      archetype,
    },
  });

  logger.info(`[Onboarding] User ${user.id} completed onboarding as @${username}`);

  return successResponse({
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      avatarUrl: updatedUser.avatarUrl,
      archetype: updatedUser.archetype,
    },
  });
});

