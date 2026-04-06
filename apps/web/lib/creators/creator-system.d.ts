/**
 * Creator Studio (v0.8.14)
 *
 * PLACEHOLDER: Community-generated content system.
 */
export interface CreatorTier {
    tier: "basic" | "verified" | "premium" | "partner";
    name: string;
    badge: string;
    revenueShare: number;
    benefits: string[];
    requirements: string[];
}
export declare const CREATOR_TIERS: CreatorTier[];
export interface FlowDifficulty {
    level: "easy" | "medium" | "hard" | "expert";
    name: string;
    icon: string;
    color: string;
    xpMultiplier: number;
}
export declare const FLOW_DIFFICULTIES: FlowDifficulty[];
/**
 * Calculate creator earnings from a flow play
 */
export declare function calculateCreatorReward(flowXp: number, revenueShare: number, goldPerPlay: number): {
    xpShare: number;
    goldBonus: number;
};
/**
 * Check if user meets creator tier requirements
 */
export declare function meetsCreatorTierRequirements(targetTier: "verified" | "premium" | "partner", stats: {
    followerCount: number;
    publishedFlowCount: number;
    avgRating: number;
    totalPlays: number;
}): {
    eligible: boolean;
    missingRequirements: string[];
};
/**
 * PLACEHOLDER: Create creator profile
 */
export declare function createCreatorProfile(_userId: string, _displayName: string, _bio?: string): Promise<null>;
/**
 * PLACEHOLDER: Submit flow for review
 */
export declare function submitFlowForReview(_flowId: string): Promise<null>;
/**
 * PLACEHOLDER: Award creator reward
 */
export declare function awardCreatorReward(_creatorId: string, _type: "xp_share" | "gold_bonus" | "milestone_bonus", _amount: number, _source: string, _description: string): Promise<null>;
