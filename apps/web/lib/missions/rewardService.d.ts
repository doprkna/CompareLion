/**
 * Mission Reward Service
 * Handles claiming and granting rewards for completed missions
 * v0.36.36 - Missions & Quests 1.0
 */
import { MissionReward } from './types';
/**
 * Claim mission reward
 * Grants rewards to user and marks mission as claimed
 *
 * @param userId - User ID
 * @param missionProgressId - MissionProgress record ID
 * @returns Success status and granted rewards
 */
export declare function claimMissionReward(userId: string, missionProgressId: string): Promise<{
    success: boolean;
    rewards?: MissionReward;
    error?: string;
}>;
/**
 * Grant mission reward to user
 * Internal helper that actually applies rewards
 *
 * @param userId - User ID
 * @param reward - Reward structure to grant
 */
export declare function grantReward(userId: string, reward: MissionReward): Promise<void>;
