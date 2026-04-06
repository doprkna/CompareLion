/**
 * Photo Challenge Moderation Service
 * Power user moderation for flagged entries
 * v0.38.12 - Power User Moderation View
 */
export interface FlaggedEntry {
    id: string;
    userId: string;
    imageUrl: string;
    category: string;
    createdAt: Date;
    flagCount: number;
    flags: Array<{
        reason: string;
        userId: string;
        createdAt: Date;
    }>;
    integrityAnalysis: {
        watermarkDetected: boolean;
        aiLikelihood: number;
        screenshotLikelihood: number;
    } | null;
    user?: {
        id: string;
        name: string | null;
        image: string | null;
    };
}
export type ModerationAction = 'approve' | 'hide';
export interface ModerationResult {
    success: boolean;
    message: string;
}
/**
 * Get all flagged entries (entries with >= 1 ScamFlag)
 * Also includes AI integrity analysis if available
 */
export declare function getFlaggedEntries(): Promise<FlaggedEntry[]>;
/**
 * Moderate an entry (approve or hide)
 *
 * Note: Proper hiding requires status field on PhotoChallengeEntry
 * For now, approve action clears flags, hide action logs but doesn't persist
 *
 * @param entryId - Entry ID to moderate
 * @param action - Action: "approve" or "hide"
 * @returns Moderation result
 */
export declare function moderateEntry(entryId: string, action: ModerationAction): Promise<ModerationResult>;
