/**
 * Moderation Engine (v0.11.10)
 *
 * PLACEHOLDER: Automated and manual content moderation.
 */
/**
 * Submit report
 */
export declare function submitReport(data: {
    reporterId: string;
    reportedUserId?: string;
    contentType?: string;
    contentId?: string;
    reason: string;
    description?: string;
}): Promise<null>;
/**
 * Block user
 */
export declare function blockUser(userId: string, blockedUserId: string, reason?: string): Promise<null>;
/**
 * AI content review
 */
export declare function reviewContentWithAI(contentType: string, contentId: string, content: string): Promise<null>;
/**
 * Take moderation action
 */
export declare function takeModerationAction(data: {
    userId: string;
    moderatorId: string;
    actionType: string;
    reason: string;
    duration?: number;
    reportId?: string;
    isPublic?: boolean;
}): Promise<null>;
/**
 * Check for auto-suspension (repeat offenses)
 */
export declare function checkAutoSuspension(userId: string): Promise<void>;
