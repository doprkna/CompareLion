/**
 * Admin Archetype Management API - Single Archetype
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

const ArchetypeUpdateSchema = z.object({
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  emoji: z.string().optional(),
});

export const PATCH = safeAsync(
  async (req: NextRequest, { params }: { params: { key: string } }) => {
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

    const { key } = params;
    const body = await req.json();
    const parsed = ArchetypeUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return validationError('Invalid archetype data', parsed.error.issues);
    }

    // Try to find archetype in DB
    let archetype = await prisma.archetype.findUnique({
      where: { key },
    });

    if (!archetype) {
      return notFoundError('Archetype');
    }

    const updates: any = {};
    if (parsed.data.description !== undefined) updates.description = parsed.data.description;
    if (parsed.data.emoji !== undefined) updates.emoji = parsed.data.emoji;

    const updated = await prisma.archetype.update({
      where: { key },
      data: updates,
    });

    // Note: Color is stored in config, not DB. Could be extended to store in DB if needed.
    return successResponse({
      archetype: updated,
      color: parsed.data.color, // Returned but not persisted (config-based)
    });
  }
);

