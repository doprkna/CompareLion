/**
 * External Rewards (v0.9.2)
 *
 * PLACEHOLDER: Real-world perks linked to in-game achievements.
 */
export interface RewardTier {
    name: string;
    minPrestige: number;
    maxPrestige?: number;
    color: string;
    icon: string;
    benefits: string[];
}
export declare const REWARD_TIERS: RewardTier[];
export interface RewardCategory {
    category: string;
    name: string;
    icon: string;
    examples: string[];
}
export declare const REWARD_CATEGORIES: RewardCategory[];
/**
 * Generate unique redemption code
 */
export declare function generateRedemptionCode(offerId: string, userId: string): string;
/**
 * Generate QR code data
 */
export declare function generateQRCodeData(redemptionCode: string): string;
/**
 * Check if user is eligible for reward
 */
export declare function isEligibleForReward(userStats: {
    prestige: number;
    level: number;
    badges: string[];
    titles: string[];
}, offer: {
    minPrestige: number;
    minLevel: number;
    requiredBadges: string[];
    requiredTitles: string[];
}): {
    eligible: boolean;
    reasons: string[];
};
/**
 * PLACEHOLDER: Claim reward
 */
export declare function claimReward(userId: string, offerId: string): Promise<null>;
/**
 * PLACEHOLDER: Verify redemption
 */
export declare function verifyRedemption(redemptionCode: string, verificationCode?: string): Promise<null>;
/**
 * PLACEHOLDER: Mint NFT proof (optional)
 */
export declare function mintRewardNFT(redemptionId: string): Promise<null>;
