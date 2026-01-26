/**
 * Unlock Skill API
 * POST /api/skills/unlock - Unlock a skill for user (admin/system)
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
import { unlockSkill } from '@/lib/services/skillService';
import { createNotification } from '@/lib/services/notificationService';
import { logger } from '@/lib/logger';

const UnlockSkillSchema = z.object({
  skillId: z.string(),
  userId: z.string().optional(), // Optional - defaults to current user
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!currentUser) {
    return unauthorizedError('User not found');
  }

  const body = await req.json();
  const parsed = UnlockSkillSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid request data', parsed.error.issues);
  }

  const targetUserId = parsed.data.userId || currentUser.id;

  // Verify skill exists
  const skill = await prisma.skill.findUnique({
    where: { id: parsed.data.skillId },
  });

  if (!skill) {
    return validationError('Skill not found');
  }

  try {
    const userSkillId = await unlockSkill(targetUserId, parsed.data.skillId);

    // Check if this was a new unlock (not duplicate)
    const userSkill = await prisma.userSkill.findUnique({
      where: { id: userSkillId },
      include: { skill: true },
    });

    if (userSkill) {
      await createNotification({
        userId: targetUserId,
        type: 'system',
        title: 'New Skill Learned',
        body: `You learned ${userSkill.skill.name}!`,
        refId: userSkill.skillId,
      });
    }

    return successResponse({
      success: true,
      message: 'Skill unlocked successfully',
      userSkillId,
    });
  } catch (error: any) {
    logger.error('[SkillsAPI] Failed to unlock skill', error);
    return validationError(error.message || 'Failed to unlock skill');
  }
});

