/**
 * Story Collection Service
 * Handles story collections (albums) and items
 * v0.40.10 - Story Collections (Albums)
 */
export interface StoryCollectionData {
    name: string;
    description: string;
    isPublic: boolean;
}
export interface StoryCollection {
    id: string;
    userId: string;
    name: string;
    description: string;
    isPublic: boolean;
    createdAt: Date;
}
export interface CollectionStory {
    itemId: string;
    storyId: string;
    userId: string;
    user: {
        id: string;
        name: string | null;
        username: string | null;
    };
    coverImageUrl: string | null;
    createdAt: Date;
    reactions: {
        like: number;
        lol: number;
        vibe: number;
    };
    stickers: Array<{
        id: string;
        emoji: string;
        count: number;
    }>;
}
/**
 * Create story collection
 */
export declare function createStoryCollection(userId: string, data: StoryCollectionData): Promise<StoryCollection>;
/**
 * Add story to collection
 */
export declare function addStoryToCollection(userId: string, collectionId: string, storyId: string): Promise<void>;
/**
 * Remove story from collection
 */
export declare function removeStoryFromCollection(userId: string, itemId: string): Promise<void>;
/**
 * Get collection with stories
 */
export declare function getCollection(collectionId: string): Promise<{
    collection: StoryCollection;
    stories: CollectionStory[];
}>;
/**
 * Get user's collections
 */
export declare function getUserCollections(userId: string): Promise<StoryCollection[]>;
/**
 * Get public collections
 */
export declare function getPublicCollections(): Promise<StoryCollection[]>;
