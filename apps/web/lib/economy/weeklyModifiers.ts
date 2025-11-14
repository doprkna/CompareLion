/**
 * Weekly Modifiers System
 * v0.34.2 - Manages rotating weekly economy modifiers
 */

import { prisma } from '@/lib/db';

export interface WeeklyModifier {
  id: string;
  name: string;
  description: string;
  bonusType: 'xp' | 'gold' | 'social' | 'streak';
  bonusValue: number; // Multiplier (1.1 = +10%)
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export const WEEKLY_MODIFIER_PRESETS: Omit<WeeklyModifier, 'id' | 'startDate' | 'endDate' | 'isActive'>[] = [
  {
    name: 'Social Week',
    description: '+10% XP on social actions (comments, reactions, follows)',
    bonusType: 'social',
    bonusValue: 1.1,
  },
  {
    name: 'Streak Surge',
    description: 'Double streak bonus (10% per day instead of 5%)',
    bonusType: 'streak',
    bonusValue: 2.0,
  },
  {
    name: 'Gold Rush',
    description: '+25% gold from all activities',
    bonusType: 'gold',
    bonusValue: 1.25,
  },
  {
    name: 'XP Boost',
    description: '+15% XP from all activities',
    bonusType: 'xp',
    bonusValue: 1.15,
  },
];

/**
 * Get the current active weekly modifier
 */
export async function getCurrentWeeklyModifier(): Promise<WeeklyModifier | null> {
  // For now, use balance settings to store active modifier
  // Future: create WeeklyModifier table in Prisma
  
  const modifierName = await prisma.balanceSetting.findUnique({
    where: { key: 'weekly_modifier_name' },
  });

  const modifierValue = await prisma.balanceSetting.findUnique({
    where: { key: 'weekly_modifier_value' },
  });

  if (!modifierName || !modifierValue || modifierName.value === 0) {
    return null;
  }

  // Map value to preset name (0 = none, 1 = Social Week, 2 = Streak Surge, etc.)
  const presetIndex = Math.floor(modifierName.value) - 1;
  const preset = WEEKLY_MODIFIER_PRESETS[presetIndex];

  if (!preset) {
    return null;
  }

  // Calculate week boundaries (Monday-Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 1 - dayOfWeek;
  
  const startDate = new Date(now);
  startDate.setDate(now.getDate() + daysUntilMonday);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 7);

  return {
    id: `weekly-${presetIndex}`,
    ...preset,
    bonusValue: modifierValue.value,
    startDate,
    endDate,
    isActive: now >= startDate && now < endDate,
  };
}

/**
 * Set the active weekly modifier
 */
export async function setWeeklyModifier(presetIndex: number, bonusValue?: number): Promise<void> {
  const preset = WEEKLY_MODIFIER_PRESETS[presetIndex];
  if (!preset) {
    throw new Error(`Invalid preset index: ${presetIndex}`);
  }

  await prisma.balanceSetting.upsert({
    where: { key: 'weekly_modifier_name' },
    update: { value: presetIndex + 1 },
    create: { key: 'weekly_modifier_name', value: presetIndex + 1 },
  });

  await prisma.balanceSetting.upsert({
    where: { key: 'weekly_modifier_value' },
    update: { value: bonusValue ?? preset.bonusValue },
    create: { key: 'weekly_modifier_value', value: bonusValue ?? preset.bonusValue },
  });
}

/**
 * Clear the active weekly modifier
 */
export async function clearWeeklyModifier(): Promise<void> {
  await prisma.balanceSetting.upsert({
    where: { key: 'weekly_modifier_name' },
    update: { value: 0 },
    create: { key: 'weekly_modifier_name', value: 0 },
  });
}

/**
 * Get time remaining until next weekly reset
 */
export function getTimeUntilReset(): { days: number; hours: number; minutes: number } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek + 1;
  
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);

  const diff = nextMonday.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}





