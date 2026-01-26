/**
 * Skills API
 * GET /api/skills - Get user's skills
 * v0.36.33 - Skills & Abilities v1
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import {
  safeAsync,
  unauthorizedError,
  successResponse,
} from '@/lib/api-handler';
import { getUserSkills } from '@/lib/services/skillService';

export const GET = safeAsync(async (req: NextRequest) => {
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

  const userSkills = await getUserSkills(user.id);

  return successResponse({
    skills: userSkills.map((us) => ({
      id: us.id,
      skillId: us.skillId,
      name: us.skill.name,
      type: us.skill.type,
      description: us.skill.description,
      power: us.skill.power,
      cooldown: us.skill.cooldown,
      icon: us.skill.icon,
      level: us.level,
      equipped: us.equipped,
      cooldownRemaining: us.cooldownRemaining,
    })),
  });
});

