/**
 * Admin Badge Management API
 * CRUD operations for badges
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

const BadgeCreateSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  icon: z.string(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  unlockType: z.enum(['level', 'event', 'season', 'special']),
  requirementValue: z.string().optional(),
});

const BadgeUpdateSchema = BadgeCreateSchema.partial();

// GET - List all badges
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

  const badges = await prisma.badge.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({ badges });
});

// POST - Create badge
export const POST = safeAsync(async (req: NextRequest) => {
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

  const body = await req.json();
  const parsed = BadgeCreateSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid badge data', parsed.error.issues);
  }

  // Check if badge key already exists
  const existing = await prisma.badge.findUnique({
    where: { key: parsed.data.key },
  });

  if (existing) {
    return validationError('Badge with this key already exists');
  }

  const badge = await prisma.badge.create({
    data: {
      key: parsed.data.key,
      name: parsed.data.name,
      description: parsed.data.description,
      icon: parsed.data.icon,
      rarity: parsed.data.rarity as any,
      unlockType: parsed.data.unlockType as any,
      requirementValue: parsed.data.requirementValue,
      isActive: true,
      slug: parsed.data.key,
    },
  });

  return successResponse({ badge });
});

