/**
 * Admin Missions API
 * CRUD operations for Mission management
 * v0.36.36 - Missions & Quests 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, forbiddenError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { z } from 'zod';
import { MissionType, ObjectiveType } from '@/lib/missions/types';

export const runtime = 'nodejs';

const MissionSchema = z.object({
  type: z.nativeEnum(MissionType),
  objectiveType: z.nativeEnum(ObjectiveType),
  targetValue: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  reward: z.object({
    xp: z.number().int().min(0).optional(),
    gold: z.number().int().min(0).optional(),
    diamonds: z.number().int().min(0).optional(),
    battlepassXP: z.number().int().min(0).optional(),
    items: z.array(z.object({
      itemId: z.string(),
      quantity: z.number().int().min(1),
    })).optional(),
  }),
  isActive: z.boolean().default(true),
  isRepeatable: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  category: z.string().optional(),
  icon: z.string().optional(),
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
 * GET /api/admin/missions
 * List all missions
 */
export const GET = safeAsync(async (req: NextRequest) => {
  await requireAdmin();

  // TODO: Implement once Mission model exists
  // const missions = await prisma.mission.findMany({
  //   orderBy: [
  //     { type: 'asc' },
  //     { sortOrder: 'asc' },
  //   ],
  // });

  return successResponse({ missions: [] });
});

/**
 * POST /api/admin/missions
 * Create new mission
 */
export const POST = safeAsync(async (req: NextRequest) => {
  await requireAdmin();

  const body = await parseBody(req);
  const parsed = MissionSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid mission data', parsed.error.issues);
  }

  // TODO: Implement once Mission model exists
  // const mission = await prisma.mission.create({
  //   data: {
  //     type: parsed.data.type,
  //     objectiveType: parsed.data.objectiveType,
  //     targetValue: parsed.data.targetValue,
  //     title: parsed.data.title,
  //     description: parsed.data.description,
  //     reward: parsed.data.reward as any,
  //     isActive: parsed.data.isActive,
  //     isRepeatable: parsed.data.isRepeatable,
  //     sortOrder: parsed.data.sortOrder,
  //     category: parsed.data.category,
  //     icon: parsed.data.icon,
  //     questChainId: parsed.data.questChainId,
  //     questStep: parsed.data.questStep,
  //     prerequisiteMissionId: parsed.data.prerequisiteMissionId,
  //   },
  // });

  return successResponse({ 
    mission: parsed.data,
    message: 'Mission creation will work once Prisma models are added',
  });
});

