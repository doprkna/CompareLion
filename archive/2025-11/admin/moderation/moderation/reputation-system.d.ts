/**
 * Reputation System (v0.11.10)
 *
 * PLACEHOLDER: User reputation scoring and trust levels.
 */
/**
 * Trust levels based on reputation score
 */
export declare const TRUST_LEVELS: {
    readonly EXCELLENT: {
        readonly min: 150;
        readonly max: 200;
        readonly label: "excellent";
        readonly emoji: "⭐";
    };
    readonly GOOD: {
        readonly min: 120;
        readonly max: 149;
        readonly label: "good";
        readonly emoji: "✅";
    };
    readonly NEUTRAL: {
        readonly min: 80;
        readonly max: 119;
        readonly label: "neutral";
        readonly emoji: "➖";
    };
    readonly POOR: {
        readonly min: 40;
        readonly max: 79;
        readonly label: "poor";
        readonly emoji: "⚠️";
    };
    readonly BANNED: {
        readonly min: 0;
        readonly max: 39;
        readonly label: "banned";
        readonly emoji: "🚫";
    };
};
/**
 * Calculate reputation score
 */
export declare function calculateReputationScore(factors: {
    reportsReceived: number;
    reportsDismissed: number;
    positiveReactions: number;
    negativeReactions: number;
    challengesCompleted: number;
    helpfulVotes: number;
}): number;
/**
 * Get trust level from score
 */
export declare function getTrustLevel(score: number): string;
/**
 * Update user reputation
 */
export declare function updateUserReputation(userId: string): Promise<null>;
/**
 * Apply reputation restrictions
 */
export declare function applyReputationRestrictions(userId: string, score: number): Promise<void>;
