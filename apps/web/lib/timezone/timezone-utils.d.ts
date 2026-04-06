/**
 * Timezone Utilities (v0.11.16)
 *
 * PLACEHOLDER: User timezone detection and scheduling.
 */
/**
 * Common timezones
 */
export declare const COMMON_TIMEZONES: readonly [{
    readonly value: "America/New_York";
    readonly label: "Eastern Time (US)";
    readonly offset: -300;
}, {
    readonly value: "America/Chicago";
    readonly label: "Central Time (US)";
    readonly offset: -360;
}, {
    readonly value: "America/Los_Angeles";
    readonly label: "Pacific Time (US)";
    readonly offset: -480;
}, {
    readonly value: "Europe/London";
    readonly label: "London (UK)";
    readonly offset: 0;
}, {
    readonly value: "Europe/Paris";
    readonly label: "Paris (FR)";
    readonly offset: 60;
}, {
    readonly value: "Europe/Prague";
    readonly label: "Prague (CZ)";
    readonly offset: 60;
}, {
    readonly value: "Europe/Berlin";
    readonly label: "Berlin (DE)";
    readonly offset: 60;
}, {
    readonly value: "Asia/Tokyo";
    readonly label: "Tokyo (JP)";
    readonly offset: 540;
}, {
    readonly value: "Asia/Shanghai";
    readonly label: "Shanghai (CN)";
    readonly offset: 480;
}, {
    readonly value: "Australia/Sydney";
    readonly label: "Sydney (AU)";
    readonly offset: 600;
}, {
    readonly value: "UTC";
    readonly label: "UTC (Universal)";
    readonly offset: 0;
}];
/**
 * Detect timezone from browser
 */
export declare function detectBrowserTimezone(): string;
/**
 * Get UTC offset for timezone
 */
export declare function getTimezoneOffset(timezone: string): number;
/**
 * Get user's timezone
 */
export declare function getUserTimezone(userId: string): Promise<string>;
/**
 * Set user's timezone
 */
export declare function setUserTimezone(userId: string, timezone: string, detectedFrom?: string): Promise<void>;
/**
 * Get next local midnight for timezone
 */
export declare function getNextLocalMidnight(timezone: string): Date;
/**
 * Convert UTC to user's local time
 */
export declare function toUserLocalTime(utcDate: Date, timezone: string): Date;
/**
 * Format time until next reset
 */
export declare function formatTimeUntilReset(nextReset: Date, timezone: string): string;
