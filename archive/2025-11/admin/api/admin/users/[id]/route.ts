/**
 * Admin User Management API
 * PATCH /api/admin/users/[id]
 * Edit user profile: status message, badges, karma, archetype, avatar frames
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

const UserUpdateSchema = z.object({
  statusMessage: z.string().max(200).optional(),
  karma: z.number().int().optional(),
  archetype: z.string().optional(),
  isPublicProfile: z.boolean().optional(),
  avatarFrameId: z.string().optional(),
  grantBadgeId: z.string().optional(),
  removeBadgeId: z.string().optional(),
});

export const PATCH = safeAsync(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return unauthorizedError('Unauthorized');
    }

    // Check admin access
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return forbiddenError('Admin access required');
    }

    const { id: userId } = params;
    const body = await req.json();
    const parsed = UserUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.issues);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return notFoundError('User');
    }

    const updates: any = {};

    // Update status message
    if (parsed.data.statusMessage !== undefined) {
      updates.statusMessage = parsed.data.statusMessage;
    }

    // Update karma
    if (parsed.data.karma !== undefined) {
      updates.karma = parsed.data.karma;
    }

    // Force archetype override
    if (parsed.data.archetype !== undefined) {
      updates.archetype = parsed.data.archetype;
    }

    // Update public profile setting
    if (parsed.data.isPublicProfile !== undefined) {
      updates.isPublicProfile = parsed.data.isPublicProfile;
    }

    // Update avatar frame
    if (parsed.data.avatarFrameId !== undefined) {
      updates.avatarFrameId = parsed.data.avatarFrameId;
    }

    // Apply user updates
    if (Object.keys(updates).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updates,
      });
    }

    // Grant badge
    if (parsed.data.grantBadgeId) {
      const existing = await prisma.userBadge.findFirst({
        where: {
          userId,
          badgeId: parsed.data.grantBadgeId,
        },
      });

      if (!existing) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: parsed.data.grantBadgeId,
            unlockedAt: new Date(),
            isClaimed: false,
          },
        });
      }
    }

    // Remove badge
    if (parsed.data.removeBadgeId) {
      await prisma.userBadge.deleteMany({
        where: {
          userId,
          badgeId: parsed.data.removeBadgeId,
        },
      });
    }

    // Get updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        statusMessage: true,
        karma: true,
        archetype: true,
        isPublicProfile: true,
        avatarFrameId: true,
        userBadges: {
          select: {
            badge: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        },
      },
    });

    return successResponse({
      success: true,
      user: updatedUser,
    });
  }
);

