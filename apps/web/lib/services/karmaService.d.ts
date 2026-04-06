/**
 * Karma Service
 * Implements karma earning/losing logic for social profiles
 * v0.36.24 - Social Profiles 2.0
 */
/**
 * Award karma for completing a question
 */
export declare function awardKarmaForQuestion(userId: string): Promise<number>;
/**
 * Award karma for completing a fight
 */
export declare function awardKarmaForFight(userId: string): Promise<number>;
/**
 * Award karma for being compared to (profile view)
 * Only once per day per viewer
 */
export declare function awardKarmaForComparison(targetUserId: string, viewerUserId: string): Promise<number>;
/**
 * Deduct karma for reports (admin action)
 */
export declare function deductKarmaForReport(userId: string, amount?: number): Promise<number>;
/**
 * Deduct karma for toxic interactions (future moderation)
 */
export declare function deductKarmaForToxicInteraction(userId: string, amount?: number): Promise<number>;
/**
 * Get user's current karma
 */
export declare function getUserKarma(userId: string): Promise<number>;
