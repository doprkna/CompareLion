/**
 * Draft Review Queue Service
 * Minimal CRUD operations for drafts, boosts, and reviews
 * v0.37.5 - Draft Review Queue + Social Boosting (Placeholder)
 */
/**
 * Submit/create a draft
 *
 * @param userId - User ID
 * @param content - Draft content (JSON or string)
 * @returns Created draft ID
 */
export declare function submitDraft(userId: string, content: any): Promise<{
    success: boolean;
    draftId?: string;
    error?: string;
}>;
/**
 * Request review for a draft (change status to pending)
 *
 * @param userId - User ID (must be draft owner)
 * @param draftId - Draft ID
 * @returns Success result
 */
export declare function requestReview(userId: string, draftId: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Boost a draft (+1 from user)
 *
 * @param userId - User ID
 * @param draftId - Draft ID
 * @returns Success result
 */
export declare function boostDraft(userId: string, draftId: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Approve a draft (power user action)
 *
 * @param reviewerId - Reviewer user ID (power user)
 * @param draftId - Draft ID
 * @param comment - Optional comment
 * @returns Success result
 */
export declare function approveDraft(reviewerId: string, draftId: string, comment?: string | null): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Reject a draft (power user action)
 *
 * @param reviewerId - Reviewer user ID (power user)
 * @param draftId - Draft ID
 * @param comment - Optional comment
 * @returns Success result
 */
export declare function rejectDraft(reviewerId: string, draftId: string, comment?: string | null): Promise<{
    success: boolean;
    error?: string;
}>;
