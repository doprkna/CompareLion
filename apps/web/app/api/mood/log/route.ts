/**
 * Mood Log API (v0.29.26)
 * 
 * POST /api/mood/log
 * Stores user's reflection sentiment in user_mood_logs
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const MoodLogSchema = z.object({
  mood: z.enum(['calm', 'chaos', 'neutral']),
  reflectionId: z.string().optional(),
});

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

  const body = await req.json().catch(() => ({}));
  const validation = MoodLogSchema.safeParse(body);

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message || 'Invalid request');
  }

  const { mood, reflectionId } = validation.data;

  // Verify reflection exists if provided
  if (reflectionId) {
    const reflection = await prisma.userReflection.findUnique({
      where: { id: reflectionId },
      select: { id: true, userId: true },
    });

    if (!reflection) {
      return validationError('Reflection not found');
    }

    if (reflection.userId !== user.id) {
      return validationError('Reflection does not belong to user');
    }
  }

  // Create mood log
  const moodLog = await (prisma as any).userMoodLog.create({
    data: {
      userId: user.id,
      reflectionId: reflectionId || null,
      mood,
      loggedAt: new Date(),
    },
  });

  return successResponse({
    success: true,
    moodLog: {
      id: moodLog.id,
      mood: moodLog.mood,
      loggedAt: moodLog.loggedAt,
    },
    message: 'Mood logged successfully',
  });
});

