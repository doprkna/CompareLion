/**
 * Economy Modifiers Application
 * v0.34.2 - Unified utility to apply all economy modifiers to rewards
 */
export interface RewardInput {
    baseXp?: number;
    baseGold?: number;
    userId: string;
    actionType?: 'social' | 'challenge' | 'reflection' | 'general';
}
export interface RewardOutput {
    finalXp: number;
    finalGold: number;
    appliedModifiers: {
        name: string;
        multiplier: number;
    }[];
    breakdown: {
        baseXp: number;
        baseGold: number;
        streakBonus: number;
        socialBonus: number;
        weeklyBonus: number;
    };
}
/**
 * Apply all active economy modifiers to a reward
 * This is the central function called by all reward distribution logic
 */
export declare function applyEconomyModifiers(input: RewardInput): Promise<RewardOutput>;
/**
 * Helper: Apply modifiers to XP only
 */
export declare function applyXpModifiers(baseXp: number, userId: string, actionType?: 'social' | 'challenge' | 'reflection' | 'general'): Promise<number>;
/**
 * Helper: Apply modifiers to gold only
 */
export declare function applyGoldModifiers(baseGold: number, userId: string): Promise<number>;
/**
 * Get summary of all active modifiers for display
 */
export declare function getActiveModifiersSummary(userId: string): Promise<{
    streak: {
        active: boolean;
        multiplier: number;
        days: number;
    };
    social: {
        active: boolean;
        multiplier: number;
    };
    weekly: {
        active: boolean;
        name: string;
        description: string;
        multiplier: number;
    } | null;
}>;
