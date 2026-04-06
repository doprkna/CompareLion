/**
 * Creator Payout System (v0.11.12)
 *
 * PLACEHOLDER: Weekly payout calculation and distribution.
 */
/**
 * Engagement weights for payout calculation
 */
export declare const ENGAGEMENT_WEIGHTS: {
    readonly view: 0.1;
    readonly completion: 1;
    readonly like: 0.5;
    readonly share: 2;
};
/**
 * Payout pool allocation
 */
export declare const POOL_ALLOCATION: {
    readonly subscriptions: 0.3;
    readonly cosmetics: 0.2;
    readonly donations: 1;
};
/**
 * Calculate weekly payout pool
 */
export declare function calculateWeeklyPool(_weekStart: Date, _weekEnd: Date): Promise<null>;
/**
 * Calculate creator engagement score for the week
 */
export declare function calculateCreatorEngagement(_creatorId: string, _weekStart: Date, _weekEnd: Date): Promise<number>;
/**
 * Distribute weekly payouts
 */
export declare function distributeWeeklyPayouts(_poolId: string): Promise<null>;
/**
 * Process payout to Stripe Connect
 */
export declare function processStripePayout(_walletId: string, _amount: number): Promise<null>;
