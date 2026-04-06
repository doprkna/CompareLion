/**
 * Beta Invite System (v0.11.8)
 *
 * PLACEHOLDER: Invite code generation and referral mechanics.
 */
/**
 * Generate unique invite code
 */
export declare function generateInviteCode(): string;
/**
 * Create beta invite
 */
export declare function createBetaInvite(creatorId?: string, options?: {
    maxUses?: number;
    expiresAt?: Date;
    source?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
}): Promise<null>;
/**
 * Validate and redeem invite code
 */
export declare function redeemInviteCode(code: string, userId: string): Promise<null>;
/**
 * Generate share link with UTM tracking
 */
export declare function generateShareLink(code: string, utmSource?: string, utmMedium?: string, utmCampaign?: string): string;
/**
 * Get referral stats for user
 */
export declare function getUserReferralStats(userId: string): Promise<null>;
/**
 * Get top referrers (leaderboard)
 */
export declare function getTopReferrers(limit?: number): Promise<never[]>;
/**
 * Get total beta users count
 */
export declare function getBetaUserCount(): Promise<number>;
/**
 * Grant referral rewards
 */
export declare function grantReferralRewards(referralId: string): Promise<null>;
