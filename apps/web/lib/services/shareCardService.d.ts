/**
 * Share Card Service
 * v0.29.15 - Share Cards
 */
/**
 * Generate share card image URL
 * Returns URL to /api/share endpoint with stats
 */
export declare function generateShareCardImage(stats: {
    xp?: number;
    level?: number;
    streak?: number;
    name?: string;
    rank?: string;
}): string;
/**
 * Generate caption template based on type
 */
export declare function generateShareCardCaption(type: 'weekly' | 'achievement' | 'comparison', stats: any): string;
