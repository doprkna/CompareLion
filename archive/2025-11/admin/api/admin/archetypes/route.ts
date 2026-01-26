/**
 * Admin Archetype Management API
 * GET /api/admin/archetypes - List archetypes with descriptions and colors
 * PATCH /api/admin/archetypes/[key] - Update archetype description/color
 * v0.36.24 - Social Profiles 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import {
  safeAsync,
  unauthorizedError,
  forbiddenError,
  notFoundError,
  validationError,
  successResponse,
} from '@/lib/api-handler';
import { z } from 'zod';

// Archetype color mapping (can be stored in DB or config)
const ARCHETYPE_COLORS: Record<string, string> = {
  Strategist: '#6366f1', // Indigo
  Explorer: '#10b981', // Green
  Collector: '#f59e0b', // Amber
  Socializer: '#ec4899', // Pink
  Challenger: '#ef4444', // Red
  Sage: '#8b5cf6', // Purple
  Trickster: '#06b6d4', // Cyan
  Balanced: '#64748b', // Slate
};

const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  Strategist: 'High winrate, defensive playstyle',
  Explorer: 'Answers many questions, curious mind',
  Collector: 'Owns many items, completionist',
  Socializer: 'Makes many comparisons, social butterfly',
  Challenger: 'Arena focus, combat enthusiast',
  Sage: 'High wisdom score from questions',
  Trickster: 'High crit build, unpredictable',
  Balanced: 'Well-rounded across all categories',
};

// GET - List all archetypes
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const admin = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!admin || admin.role !== 'ADMIN') {
    return forbiddenError('Admin access required');
  }

  // Get archetypes from DB (Archetype model) or use defaults
  const dbArchetypes = await prisma.archetype.findMany({
    select: {
      key: true,
      name: true,
      description: true,
      emoji: true,
    },
  });

  // Merge with color/description config
  const archetypes = dbArchetypes.map((arch) => ({
    key: arch.key,
    name: arch.name,
    description: ARCHETYPE_DESCRIPTIONS[arch.name] || arch.description,
    emoji: arch.emoji,
    color: ARCHETYPE_COLORS[arch.name] || '#64748b',
  }));

  // Add any missing archetypes from config
  Object.entries(ARCHETYPE_DESCRIPTIONS).forEach(([name, desc]) => {
    if (!archetypes.find((a) => a.name === name)) {
      archetypes.push({
        key: name.toLowerCase(),
        name,
        description: desc,
        emoji: '🎭',
        color: ARCHETYPE_COLORS[name] || '#64748b',
      });
    }
  });

  return successResponse({ archetypes });
});

