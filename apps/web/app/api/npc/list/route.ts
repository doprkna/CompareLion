/**
 * NPC List API (v0.29.23)
 * 
 * GET /api/npc/list
 * Manage / seed NPCs (admin only)
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@/lib/db';

export const GET = safeAsync(async (_req: NextRequest) => {
  const auth = await requireAdmin(_req);
  if (!auth.success || !auth.user) {
    return unauthorizedError('Admin required');
  }

  const npcs = await prisma.npcProfile.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      npcId: true,
      name: true,
      title: true,
      archetypeAffinity: true,
      tone: true,
      isActive: true,
      appearanceRate: true,
      minLevel: true,
      _count: {
        select: {
          dialogues: true,
          interactions: true,
        },
      },
    },
  });

  return successResponse({
    npcs,
    total: npcs.length,
    active: npcs.filter(n => n.isActive).length,
  });
});

