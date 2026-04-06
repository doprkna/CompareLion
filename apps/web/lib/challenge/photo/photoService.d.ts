/**
 * Photo Challenge Service
 * Handle photo challenge entries, votes, and scoring
 * v0.37.12 - Photo Challenge
 */
export interface PhotoEntry {
    id: string;
    userId: string;
    imageUrl: string;
    category: string;
    createdAt: Date;
    user?: {
        id: string;
        name: string | null;
        image: string | null;
    };
    appealScore?: number;
    creativityScore?: number;
    userVotes?: {
        appeal: boolean;
        creativity: boolean;
    };
}
export interface VoteResult {
    success: boolean;
    appealScore: number;
    creativityScore: number;
    userVotes: {
        appeal: boolean;
        creativity: boolean;
    };
    error?: string;
}
/**
 * Upload and save photo file
 *
 * @param file - File object from FormData
 * @param userId - User ID
 * @returns Public URL path to saved file
 */
export declare function uploadPhoto(file: File, userId: string): Promise<string>;
/**
 * Submit photo to challenge
 *
 * @param userId - User ID
 * @param imageUrl - URL to uploaded image
 * @param category - Challenge category
 * @returns Created entry
 */
export declare function submitToChallenge(userId: string, imageUrl: string, category: string): Promise<PhotoEntry>;
/**
 * Vote on a photo entry
 *
 * @param userId - User ID
 * @param entryId - Entry ID
 * @param voteType - Vote type: 'appeal' or 'creativity'
 * @returns Vote result with scores
 */
export declare function voteOnEntry(userId: string, entryId: string, voteType: 'appeal' | 'creativity'): Promise<VoteResult>;
/**
 * Compute score for an entry and vote type
 *
 * @param entryId - Entry ID
 * @param voteType - Vote type: 'appeal' or 'creativity'
 * @returns Score (count of votes)
 */
export declare function computeScore(entryId: string, voteType: 'appeal' | 'creativity'): Promise<number>;
/**
 * Get challenge entries by category
 *
 * @param category - Challenge category (optional)
 * @param userId - User ID for vote state (optional)
 * @returns List of entries with scores
 */
export declare function getChallengeEntries(category?: string, userId?: string): Promise<PhotoEntry[]>;
