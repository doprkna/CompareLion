/**
 * Admin Mission CRUD API
 * Update/Delete mission by ID
 * v0.36.36 - Missions & Quests 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, forbiddenError, validationError, notFoundError, successResponse, parseBody } from '@/lib/api-handler';
import { z } from 'zod';
import { MissionType, ObjectiveType } from '@/lib/missions/types';

export const runtime = 'nodejs';

const MissionUpdateSchema = z.object({
  type: z.nativeEnum(MissionType).optional(),
  objectiveType: z.nativeEnum(ObjectiveType).optional(),
  targetValue: z.number().int().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  reward: z.object({
    xp: z.number().int().min(0).optional(),
    gold: z.number().int().min(0).optional(),
    diamonds: z.number().int().min(0).optional(),
    battlepassXP: z.number().int().min(0).optional(),
    items: z.array(z.object({
      itemId: z.string(),
      quantity: z.number().int().min(1),
    })).optional(),
  }).optional(),
  isActive: z.boolean().optional(),
  isRepeatable: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  category: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  questChainId: z.string().optional().nullable(),
  questStep: z.number().int().optional().nullable(),
  prerequisiteMissionId: z.string().optional().nullable(),
});

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
 * PUT /api/admin/missions/[id]
 * Update mission
 */
export const PUT = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  await requireAdmin();

  const body = await parseBody(req);
  const parsed = MissionUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid mission data', parsed.error.issues);
  }

  // TODO: Implement once Mission model exists
  // const mission = await prisma.mission.update({
  //   where: { id: params.id },
  //   data: parsed.data as any,
  // });

  return successResponse({ 
    mission: { id: params.id, ...parsed.data },
    message: 'Mission update will work once Prisma models are added',
  });
});

/**
 * DELETE /api/admin/missions/[id]
 * Delete mission
 */
export const DELETE = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  await requireAdmin();

  // TODO: Implement once Mission model exists
  // const mission = await prisma.mission.findUnique({
  //   where: { id: params.id },
  // });

  // if (!mission) {
  //   return notFoundError('Mission');
  // }

  // await prisma.mission.delete({
  //   where: { id: params.id },
  // });

  return successResponse({ 
    deleted: true,
    message: 'Mission deletion will work once Prisma models are added',
  });
});

