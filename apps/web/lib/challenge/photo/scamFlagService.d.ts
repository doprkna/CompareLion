/**
 * Scam Flag Service
 * Handle scam flagging for photo challenge entries
 * v0.38.6 - Image Integrity Check + Scam Alert
 */
export type ScamFlagReason = 'watermark' | 'stock' | 'ai' | 'meme' | 'other';
export interface ScamFlagResult {
    success: boolean;
    message: string;
    flagCount: number;
}
/**
 * Flag an entry as scam
 *
 * @param userId - User ID flagging the entry
 * @param entryId - Entry ID to flag
 * @param reason - Reason for flagging
 * @returns Result with playful message and flag count
 */
export declare function flagScam(userId: string, entryId: string, reason: ScamFlagReason): Promise<ScamFlagResult>;
/**
 * Get integrity analysis and flag count for an entry
 *
 * @param entryId - Entry ID
 * @returns Integrity analysis and flag count
 */
export declare function getIntegrityData(entryId: string): Promise<{
    analysis: {
        watermarkDetected: boolean;
        stockPhotoLikelihood: number;
        aiGeneratedLikelihood: number;
        screenshotLikelihood: number;
        notes: string;
    } | null;
    flagCount: number;
}>;
