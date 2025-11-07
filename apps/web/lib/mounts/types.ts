/**
 * Mount Trials Types - Generated from Prisma
 * Use '@parel/db/generated' for core model schemas
 */
import { MountTrialSchema, UserMountTrialSchema } from '@parel/db/generated';
import { z } from 'zod';

// Generated types from Prisma
export type MountTrial = z.infer<typeof MountTrialSchema>;
export type UserMountTrial = z.infer<typeof UserMountTrialSchema>;

// UI-specific type (not in Prisma schema)
export type MountTrialRewardType = 'badge' | 'speed' | 'karma' | 'xp' | 'gold';

export interface MountTrialWithProgress extends MountTrial {
  userProgress?: UserMountTrial;
  isExpired: boolean;
  attemptsRemaining: number | null;
}

export interface MountTrialReward {
  type: MountTrialRewardType;
  value: number;
  description: string;
}

// Reward type metadata (UI-only)
export const REWARD_TYPE_META: Record<MountTrialRewardType, { label: string; icon: string; unit: string }> = {
  badge: {
    label: 'Cosmetic Badge',
    icon: 'ðŸŽ–ï¸',
    unit: 'badge',
  },
  speed: {
    label: 'Speed Boost',
    icon: 'âš¡',
    unit: '+{value}',
  },
  karma: {
    label: 'Karma Bonus',
    icon: 'âœ¨',
    unit: '+{value}',
  },
  xp: {
    label: 'XP Reward',
    icon: 'ðŸ“ˆ',
    unit: '+{value} XP',
  },
  gold: {
    label: 'Gold Reward',
    icon: 'ðŸ’°',
    unit: '+{value} Gold',
  },
};

// Trial templates (UI-only)
export interface TrialGoal {
  type: 'daily_missions' | 'karma_earned' | 'challenges_completed' | 'reflections_posted';
  target: number;
  description: string;
}

export const TRIAL_TEMPLATES: Array<Omit<MountTrial, 'id' | 'mountId' | 'createdAt' | 'updatedAt'>> = [
  {
    name: 'Daily Dedication',
    description: 'Complete 3 daily missions while mounted',
    rewardType: 'xp',
    rewardValue: 100,
    maxAttempts: null,
    expiresAt: null,
    isActive: true,
  },
  {
    name: 'Karma Collector',
    description: 'Earn 50 karma points with this mount',
    rewardType: 'speed',
    rewardValue: 1,
    maxAttempts: 1,
    expiresAt: null,
    isActive: true,
  },
];
