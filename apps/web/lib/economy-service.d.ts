/**
 * Economy Service
 * v0.18.0 - Handles XP/coins conversion and rewards
 */
export type RewardAction = 'questionAnswered' | 'correctAnswer' | 'dailyLogin' | 'streakBonus' | 'submissionApproved' | 'eventParticipation' | 'upvoteReceived';
/**
 * Award XP and automatically convert to coins
 */
export declare function awardXP(userId: string, xpAmount: number, source?: string): Promise<{
    xp: number;
    coins: number;
    totalXP: number;
    totalCoins: number;
}>;
/**
 * Award coins directly (for specific rewards)
 */
export declare function awardCoins(userId: string, amount: number, source?: string): Promise<{
    coins: number;
    totalCoins: number;
}>;
/**
 * Spend coins (for purchases)
 */
export declare function spendCoins(userId: string, amount: number, itemName?: string): Promise<{
    success: boolean;
    remainingCoins: number;
    error?: string;
}>;
/**
 * Get coin reward for a specific action
 */
export declare function awardActionReward(userId: string, action: RewardAction): Promise<{
    coins: number;
    totalCoins: number;
}>;
/**
 * Award combo: XP + action bonus
 */
export declare function awardCombo(userId: string, xpAmount: number, action: RewardAction): Promise<{
    xp: number;
    coins: number;
    bonusCoins: number;
    totalCoins: number;
}>;
/**
 * Get user's current economy stats
 */
export declare function getUserEconomyStats(userId: string): Promise<any>;
