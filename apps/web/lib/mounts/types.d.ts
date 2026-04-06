/**
 * Mount Trials Types - Generated from Prisma
 * Use '@parel/db/generated' for core model schemas
 */
import { MountTrialSchema, UserMountTrialSchema } from '@parel/db/generated';
import { z } from 'zod';
export type MountTrial = z.infer<typeof MountTrialSchema>;
export type UserMountTrial = z.infer<typeof UserMountTrialSchema>;
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
export declare const REWARD_TYPE_META: Record<MountTrialRewardType, {
    label: string;
    icon: string;
    unit: string;
}>;
export interface TrialGoal {
    type: 'daily_missions' | 'karma_earned' | 'challenges_completed' | 'reflections_posted';
    target: number;
    description: string;
}
export declare const TRIAL_TEMPLATES: Array<Omit<MountTrial, 'id' | 'mountId' | 'createdAt' | 'updatedAt'>>;
