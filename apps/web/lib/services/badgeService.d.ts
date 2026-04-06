export declare function grantBadge(userId: string, badgeSlug: string): Promise<{
    granted: boolean;
    reason: string;
    userBadge?: undefined;
} | {
    granted: boolean;
    userBadge: any;
    reason?: undefined;
}>;
export declare function checkAndGrantPurchaseBadges(userId: string): Promise<string[]>;
export declare function checkAndGrantSubscriptionBadge(userId: string): Promise<string[]>;
