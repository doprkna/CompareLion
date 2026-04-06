/**
 * Mount Trials Logic
 * v0.34.4 - Trial counter system, rewards, and daily reset
 */
import { MountTrial, UserMountTrial, MountTrialWithProgress, MountTrialReward } from './types';
/**
 * Get all active trials for a specific mount
 */
export declare function getMountTrials(mountId: string): Promise<MountTrial[]>;
/**
 * Get all available trials for a user (with progress)
 */
export declare function getUserAvailableTrials(userId: string): Promise<MountTrialWithProgress[]>;
/**
 * Update user trial progress
 */
export declare function updateTrialProgress(userId: string, trialId: string, incrementBy?: number): Promise<UserMountTrial>;
/**
 * Complete a trial and apply rewards
 */
export declare function completeTrial(userId: string, trialId: string): Promise<MountTrialReward>;
/**
 * Apply trial reward to user
 */
export declare function applyTrialReward(userId: string, reward: MountTrialReward): Promise<void>;
/**
 * Reset daily trials (call via cron at UTC 00:00)
 */
export declare function resetDailyTrials(): Promise<void>;
/**
 * Get trial completion stats (for admin metrics)
 */
export declare function getTrialStats(): Promise<{
    totalTrials: number;
    activeTrials: number;
    totalCompletions: number;
    completionRate: number;
}>;
