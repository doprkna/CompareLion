/**
 * Subscription System (v0.11.11)
 *
 * PLACEHOLDER: Premium subscription management with Stripe.
 */
/**
 * Subscription plans
 */
export declare const SUBSCRIPTION_PLANS: {
    readonly FREE: {
        readonly name: "free";
        readonly displayName: "Free";
        readonly price: 0;
        readonly xpMultiplier: 1;
        readonly features: {
            readonly basicThemes: true;
            readonly basicBadges: true;
            readonly adSupported: true;
        };
    };
    readonly PREMIUM: {
        readonly name: "premium";
        readonly displayName: "💎 Premium Supporter";
        readonly price: 499;
        readonly xpMultiplier: 1.1;
        readonly features: {
            readonly xpBonus: true;
            readonly exclusiveThemes: true;
            readonly exclusiveBadges: true;
            readonly cosmeticAura: true;
            readonly adFree: true;
            readonly prioritySupport: true;
        };
    };
};
/**
 * Get user's active subscription
 */
export declare function getUserSubscription(_userId: string): Promise<null>;
/**
 * Check if user has premium
 */
export declare function isPremiumUser(_userId: string): Promise<boolean>;
/**
 * Get XP multiplier for user
 */
export declare function getUserXpMultiplier(_userId: string): Promise<number>;
/**
 * Create Stripe checkout session
 */
export declare function createCheckoutSession(_userId: string, _planName: string, _successUrl: string, _cancelUrl: string): Promise<null>;
/**
 * Cancel subscription
 */
export declare function cancelSubscription(_userId: string): Promise<null>;
/**
 * Reactivate cancelled subscription
 */
export declare function reactivateSubscription(_userId: string): Promise<null>;
