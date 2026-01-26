/**
 * Level Up Skill API
 * POST /api/skills/level-up - Level up a skill (internal/system)
 * v0.36.33 - Skills & Abilities v1
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import {
  safeAsync,
  unauthorizedError,
  validationError,
  successResponse,
} from '@/lib/api-handler';
import { z } from 'zod';
import { levelUpSkill } from '@/lib/services/skillService';
import { createNotification } from '@/lib/services/notificationService';
import { logger } from '@/lib/logger';

const LevelUpSkillSchema = z.object({
  userSkillId: z.string(),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json();
  const parsed = LevelUpSkillSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid request data', parsed.error.issues);
  }

  // Verify skill belongs to user
  const userSkill = await prisma.userSkill.findFirst({
    where: {
      id: parsed.data.userSkillId,
      userId: user.id,
    },
    include: {
      skill: true,
    },
  });

  if (!userSkill) {
    return validationError('Skill not found or does not belong to user');
  }

  try {
    const { newLevel } = await levelUpSkill(parsed.data.userSkillId);

    await createNotification({
      userId: user.id,
      type: 'system',
      title: 'Skill Level Up',
      body: `${userSkill.skill.name} leveled up to ${newLevel}!`,
      refId: userSkill.skillId,
    });

    return successResponse({
      success: true,
      message: 'Skill leveled up successfully',
      newLevel,
    });
  } catch (error: any) {
    logger.error('[SkillsAPI] Failed to level up skill', error);
    return validationError(error.message || 'Failed to level up skill');
  }
});

