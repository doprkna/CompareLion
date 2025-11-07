/**
 * Profile Privacy API (v0.29.30)
 * 
 * GET /api/profile/privacy - Returns current visibility settings
 * POST /api/profile/privacy - Updates privacy settings
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const PrivacySchema = z.object({
  privacyLevel: z.enum(['private', 'mid', 'public']).optional(),
  showComparisons: z.boolean().optional(),
  showStats: z.boolean().optional(),
});

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      settings: true,
      allowPublicCompare: true,
      visibility: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const settings = (user.settings as any) || {};
  const privacyLevel = settings.privacyLevel || 'mid'; // Default to mid
  const showComparisons = settings.showComparisons !== undefined ? settings.showComparisons : (user.allowPublicCompare ?? true);
  const showStats = settings.showStats !== undefined ? settings.showStats : true;

  return successResponse({
    privacy: {
      privacyLevel,
      showComparisons,
      showStats,
    },
    legacy: {
      allowPublicCompare: user.allowPublicCompare,
      visibility: user.visibility,
    },
  });
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      settings: true,
      allowPublicCompare: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json().catch(() => ({}));
  const validation = PrivacySchema.safeParse(body);

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message || 'Invalid request');
  }

  const { privacyLevel, showComparisons, showStats } = validation.data;

  // Merge with existing settings
  const currentSettings = (user.settings as any) || {};
  const updatedSettings: any = {
    ...currentSettings,
  };

  if (privacyLevel !== undefined) {
    updatedSettings.privacyLevel = privacyLevel;
  }

  if (showComparisons !== undefined) {
    updatedSettings.showComparisons = showComparisons;
    // Also update legacy field for backward compatibility
    await prisma.user.update({
      where: { id: user.id },
      data: { allowPublicCompare: showComparisons },
    });
  }

  if (showStats !== undefined) {
    updatedSettings.showStats = showStats;
  }

  // Update settings
  await prisma.user.update({
    where: { id: user.id },
    data: {
      settings: updatedSettings,
    },
  });

  // Log privacy change (optional - for audit)
  await prisma.actionLog.create({
    data: {
      userId: user.id,
      action: 'privacy_settings_updated',
      metadata: {
        privacyLevel: privacyLevel || currentSettings.privacyLevel,
        showComparisons: showComparisons !== undefined ? showComparisons : currentSettings.showComparisons,
        showStats: showStats !== undefined ? showStats : currentSettings.showStats,
        updatedAt: new Date().toISOString(),
      },
    },
  }).catch(() => {}); // Ignore logging errors

  return successResponse({
    success: true,
    privacy: {
      privacyLevel: updatedSettings.privacyLevel || 'mid',
      showComparisons: updatedSettings.showComparisons !== undefined ? updatedSettings.showComparisons : true,
      showStats: updatedSettings.showStats !== undefined ? updatedSettings.showStats : true,
    },
    message: `Privacy settings updated to ${privacyLevel || updatedSettings.privacyLevel || 'mid'}`,
  });
});

