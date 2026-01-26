/**
 * Admin Update Skill API
 * PATCH /api/admin/skills/[id] - Update a skill
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
  notFoundError,
  successResponse,
} from '@/lib/api-handler';
import { z } from 'zod';

const UpdateSkillSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  power: z.number().optional(),
  cooldown: z.number().nullable().optional(),
  icon: z.string().nullable().optional(),
  scaling: z.any().optional(),
});

export const PATCH = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const skillId = params.id;
  const body = await req.json();
  const parsed = UpdateSkillSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid request data', parsed.error.issues);
  }

  // Check if skill exists
  const existing = await prisma.skill.findUnique({
    where: { id: skillId },
  });

  if (!existing) {
    return notFoundError('Skill not found');
  }

  // Update skill
  const updated = await prisma.skill.update({
    where: { id: skillId },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      ...(parsed.data.power !== undefined && { power: parsed.data.power }),
      ...(parsed.data.cooldown !== undefined && { cooldown: parsed.data.cooldown }),
      ...(parsed.data.icon !== undefined && { icon: parsed.data.icon }),
      ...(parsed.data.scaling !== undefined && { scaling: parsed.data.scaling }),
    },
  });

  return successResponse({
    success: true,
    skill: updated,
  });
});

