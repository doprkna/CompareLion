/**
 * Regional Event Scheduler (v0.11.15)
 *
 * PLACEHOLDER: Time-zone aware regional events.
 */
export declare const REGIONS: {
    readonly GLOBAL: {
        readonly code: "GLOBAL";
        readonly name: "Global";
        readonly timezone: "UTC";
        readonly locale: "en";
        readonly flag: "🌍";
    };
    readonly EU: {
        readonly code: "EU";
        readonly name: "Europe";
        readonly timezone: "Europe/Prague";
        readonly locale: "en";
        readonly flag: "🇪🇺";
    };
    readonly US: {
        readonly code: "US";
        readonly name: "United States";
        readonly timezone: "America/New_York";
        readonly locale: "en";
        readonly flag: "🇺🇸";
    };
    readonly JP: {
        readonly code: "JP";
        readonly name: "Japan";
        readonly timezone: "Asia/Tokyo";
        readonly locale: "jp";
        readonly flag: "🇯🇵";
    };
};
/**
 * Get active regional events
 */
export declare function getActiveRegionalEvents(region?: string): Promise<never[]>;
/**
 * Trigger regional events (cron job)
 */
export declare function triggerRegionalEvents(): Promise<void>;
/**
 * Create regional event
 */
export declare function createRegionalEvent(data: {
    name: string;
    description?: string;
    region: string;
    startDate: Date;
    endDate: Date;
    eventType: string;
    theme?: string;
    rewardXp?: number;
    rewardGold?: number;
    isRecurring?: boolean;
}): Promise<null>;
/**
 * Get region for user (from IP or profile)
 */
export declare function getUserRegion(ipAddress?: string): string;
