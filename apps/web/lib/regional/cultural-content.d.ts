/**
 * Cultural Content Manager (v0.11.15)
 *
 * PLACEHOLDER: Region-specific items and themes.
 */
/**
 * Sample cultural events
 */
export declare const CULTURAL_EVENTS: {
    EU: {
        name: string;
        months: number[];
        theme: string;
        items: string[];
    }[];
    US: {
        name: string;
        months: number[];
        theme: string;
        items: string[];
    }[];
    JP: {
        name: string;
        months: number[];
        theme: string;
        items: string[];
    }[];
};
/**
 * Get cultural items for region
 */
export declare function getCulturalItems(region: string, month?: number): Promise<never[]>;
/**
 * Seed cultural items
 */
export declare function seedCulturalContent(): Promise<void>;
/**
 * Get region leaderboard
 */
export declare function getRegionalLeaderboard(region: string, limit?: number): Promise<never[]>;
