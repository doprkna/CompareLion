/**
 * Engagement Tracking (v0.11.12)
 *
 * PLACEHOLDER: Track content engagement for creator payouts.
 */
/**
 * Record engagement event
 */
export declare function recordEngagement(_data: {
    contentType: string;
    contentId: string;
    creatorId: string;
    userId?: string;
    type: "view" | "completion" | "like" | "share";
    fingerprint?: string;
}): Promise<null>;
/**
 * Get creator engagement stats
 */
export declare function getCreatorEngagementStats(_creatorId: string, _weekStart?: Date): Promise<null>;
/**
 * Detect suspicious engagement patterns
 */
export declare function detectFraudulentEngagement(_contentId: string, _contentType: string): Promise<string[]>;
