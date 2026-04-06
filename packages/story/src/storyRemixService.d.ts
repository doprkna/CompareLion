/**
 * Story Remix Service
 * Handle story remixes and extensions
 * v0.40.14 - Story Remixes 1.0 (Remix & Extend Existing Stories)
 */
export type RemixType = 'extend' | 'response' | 'alt';
export interface RemixMetadata {
    parentStoryId: string;
    parentAuthor: {
        id: string;
        name: string | null;
        username: string | null;
    };
    remixType: RemixType;
}
/**
 * Get story panels for remix source
 */
export declare function getStoryPanels(storyId: string): Promise<{
    panels: Array<{
        imageUrl: string;
        caption: string;
        vibeTag: string;
        microStory: string;
        role?: string | null;
    }>;
    author: {
        id: string;
        name: string | null;
        username: string | null;
    };
    panelCount: number;
    createdAt: Date;
}>;
/**
 * Create remix story
 */
export declare function createRemixStory(userId: string, parentStoryId: string, newPanelImages: string[], newPanelTexts?: (string | null)[]): Promise<{
    storyId: string;
    status: string;
}>;
/**
 * Get remix metadata
 */
export declare function getRemixMetadata(storyId: string): Promise<RemixMetadata | null>;
/**
 * Get remix count for a story
 */
export declare function getRemixCount(parentStoryId: string): Promise<number>;
