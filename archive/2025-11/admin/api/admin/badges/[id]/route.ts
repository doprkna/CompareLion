/**
 * Admin Badge Management API - Single Badge
 * PATCH /api/admin/badges/[id] - Update badge
 * DELETE /api/admin/badges/[id] - Delete badge
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

const BadgeUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']).optional(),
  unlockType: z.enum(['level', 'event', 'season', 'special']).optional(),
  requirementValue: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const PATCH = safeAsync(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
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

    const { id } = params;
    const body = await req.json();
    const parsed = BadgeUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return validationError('Invalid badge data', parsed.error.issues);
    }

    const badge = await prisma.badge.findUnique({
      where: { id },
    });

    if (!badge) {
      return notFoundError('Badge');
    }

    const updates: any = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.description !== undefined) updates.description = parsed.data.description;
    if (parsed.data.icon !== undefined) updates.icon = parsed.data.icon;
    if (parsed.data.rarity !== undefined) updates.rarity = parsed.data.rarity as any;
    if (parsed.data.unlockType !== undefined) updates.unlockType = parsed.data.unlockType as any;
    if (parsed.data.requirementValue !== undefined)
      updates.requirementValue = parsed.data.requirementValue;
    if (parsed.data.isActive !== undefined) updates.isActive = parsed.data.isActive;

    const updated = await prisma.badge.update({
      where: { id },
      data: updates,
    });

    return successResponse({ badge: updated });
  }
);

export const DELETE = safeAsync(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
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

    const { id } = params;

    const badge = await prisma.badge.findUnique({
      where: { id },
    });

    if (!badge) {
      return notFoundError('Badge');
    }

    // Soft delete by setting isActive to false
    await prisma.badge.update({
      where: { id },
      data: { isActive: false },
    });

    return successResponse({ success: true, message: 'Badge deactivated' });
  }
);

