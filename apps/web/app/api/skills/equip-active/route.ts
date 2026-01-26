/**
 * Equip Active Skill API
 * POST /api/skills/equip-active - Equip an active skill
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
import { equipActiveSkill } from '@/lib/services/skillService';
import { createNotification } from '@/lib/services/notificationService';
import { logger } from '@/lib/logger';

const EquipSkillSchema = z.object({
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
  const parsed = EquipSkillSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid request data', parsed.error.issues);
  }

  try {
    await equipActiveSkill(user.id, parsed.data.userSkillId);

    // Get skill name for notification
    const userSkill = await prisma.userSkill.findUnique({
      where: { id: parsed.data.userSkillId },
      include: { skill: true },
    });

    if (userSkill) {
      await createNotification({
        userId: user.id,
        type: 'system',
        title: 'Active Skill Updated',
        body: `You equipped ${userSkill.skill.name}`,
        refId: userSkill.skillId,
      });
    }

    return successResponse({
      success: true,
      message: 'Skill equipped successfully',
    });
  } catch (error: any) {
    logger.error('[SkillsAPI] Failed to equip skill', error);
    return validationError(error.message || 'Failed to equip skill');
  }
});

