/**
 * Karma Scoring System
 *
 * Karma represents moral alignment and consistency.
 * Range: -∞ to +∞ (negative = chaotic, positive = aligned)
 *
 * Factors:
 * - Answer sentiment (truth vs dare, consistency)
 * - Challenge acceptance (+1) vs decline (-1)
 * - Social interactions (helping others +1, ignoring -0.5)
 * - Admin adjustments (optional manual override)
 */
/**
 * Calculate karma delta from answer sentiment
 * @param answer User's answer text
 * @param questionType Question category/type
 * @returns Karma change (-5 to +5)
 */
export declare function calculateAnswerKarma(answer: string, _questionType?: string): number;
/**
 * Calculate karma from challenge interaction
 * @param action 'accepted' | 'declined'
 * @returns Karma change
 */
export declare function calculateChallengeKarma(action: 'accepted' | 'declined'): number;
/**
 * Calculate karma from social interaction
 * @param action 'helped' | 'ignored' | 'responded' | 'reacted'
 * @returns Karma change
 */
export declare function calculateSocialKarma(action: string): number;
/**
 * Get karma tier label
 * @param karma Current karma score
 * @returns Karma tier description
 */
export declare function getKarmaTier(karma: number): {
    tier: string;
    label: string;
    color: string;
};
/**
 * Update user's karma score
 * @param userId User ID
 * @param delta Karma change amount
 * @returns Updated karma score
 */
export declare function updateKarma(userId: string, delta: number): Promise<number>;
/**
 * Set karma score (admin override)
 * @param userId User ID
 * @param score New karma score
 */
export declare function setKarma(userId: string, score: number): Promise<void>;
