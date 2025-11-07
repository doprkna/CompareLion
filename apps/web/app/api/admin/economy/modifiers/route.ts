/**
 * Admin Economy Modifiers API
 * v0.34.2 - Manage economy modifiers (streaks, social bonuses, weekly modifiers)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import {
  safeAsync,
  authError,
  validationError,
  successResponse,
} from '@/lib/api-handler';
import { getEconomyModifiers, seedEconomyModifiers } from '@/lib/economy/seedModifiers';
import { getCurrentWeeklyModifier, WEEKLY_MODIFIER_PRESETS } from '@/lib/economy/weeklyModifiers';

/**
 * GET /api/admin/economy/modifiers
 * Returns all economy modifiers and current weekly modifier
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return authError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'DEVOPS')) {
    return authError('Admin access required');
  }

  const existingSettings = await prisma.balanceSetting.count({
    where: {
      key: {
        in: ['streak_xp_bonus', 'social_xp_multiplier', 'weekly_modifier_value'],
      },
    },
  });

  if (existingSettings < 3) {
    await seedEconomyModifiers();
  }

  const modifiers = await getEconomyModifiers();
  const weeklyModifier = await getCurrentWeeklyModifier();

  return successResponse({
    modifiers,
    weeklyModifier,
    availableWeeklyPresets: WEEKLY_MODIFIER_PRESETS,
  });
});

/**
 * POST /api/admin/economy/modifiers
 * Update economy modifiers
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return authError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'DEVOPS')) {
    return authError('Admin access required');
  }

  const body = await req.json();
  const { key, value, weeklyModifierPreset } = body;

  if (key && value !== undefined) {
    const validKeys = ['streak_xp_bonus', 'social_xp_multiplier', 'weekly_modifier_value'];

    if (!validKeys.includes(key)) {
      return validationError('Invalid modifier key');
    }

    if (typeof value !== 'number' || value < 0) {
      return validationError('Invalid value');
    }

    await prisma.balanceSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return successResponse({ key, value }, `Modifier ${key} updated to ${value}`);
  }

  if (weeklyModifierPreset !== undefined) {
    if (weeklyModifierPreset < 0 || weeklyModifierPreset > WEEKLY_MODIFIER_PRESETS.length) {
      return validationError('Invalid preset index');
    }

    if (weeklyModifierPreset === 0) {
      await prisma.balanceSetting.upsert({
        where: { key: 'weekly_modifier_name' },
        update: { value: 0 },
        create: { key: 'weekly_modifier_name', value: 0 },
      });

      return successResponse(null, 'Weekly modifier cleared');
    }

    const preset = WEEKLY_MODIFIER_PRESETS[weeklyModifierPreset - 1];

    await prisma.balanceSetting.upsert({
      where: { key: 'weekly_modifier_name' },
      update: { value: weeklyModifierPreset },
      create: { key: 'weekly_modifier_name', value: weeklyModifierPreset },
    });

    await prisma.balanceSetting.upsert({
      where: { key: 'weekly_modifier_value' },
      update: { value: preset.bonusValue },
      create: { key: 'weekly_modifier_value', value: preset.bonusValue },
    });

    return successResponse({ preset: preset.name, value: preset.bonusValue }, `Weekly modifier set to: ${preset.name}`);
  }

  return validationError('Missing required fields');
});
