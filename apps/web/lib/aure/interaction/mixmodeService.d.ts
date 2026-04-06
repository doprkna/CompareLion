/**
 * AURE Interaction Engine - Mix Mode Service 2.0
 * Generates vibe stories + collage from multiple rating requests
 * v0.39.8 - Mix Mode 2.0 (Multi-Image Vibe Story)
 */
export interface MixStory {
    id: string;
    userId: string;
    requestIds: string[];
    story: string;
    labels: string[];
    moodScore: number;
    createdAt: Date;
}
export interface MixStoryResult {
    story: string;
    labels: string[];
    moodScore: number;
}
/**
 * Generate mix story from multiple rating requests
 * Combines AURE summaries into AI-generated vibe story
 */
export declare function generateMixStory(userId: string, requestIds: string[]): Promise<MixStory>;
/**
 * Get image URLs for collage generation
 */
export declare function getMixImageUrls(requestIds: string[]): Promise<string[]>;
