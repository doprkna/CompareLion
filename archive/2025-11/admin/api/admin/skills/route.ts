/**
 * Admin Skills API
 * GET /api/admin/skills - Get all skills
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

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const skills = await prisma.skill.findMany({
    orderBy: [
      { type: 'asc' },
      { name: 'asc' },
    ],
  });

  return successResponse({
    skills,
  });
});

