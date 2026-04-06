/**
 * Story Feed Service
 * Handles story feed queries and reactions
 * v0.40.7 - Story Publishing & Visibility Controls 1.0
 */
export type StoryVisibility = 'public' | 'private' | 'friends';
export interface StoryFeedParams {
    limit?: number;
    cursor?: string;
    createdBefore?: Date;
    sort?: 'ranked' | 'latest';
}
export interface StorySticker {
    id: string;
    emoji: string;
    count: number;
}
export interface StoryFeedItem {
    id: string;
    userId: string;
    user: {
        id: string;
        name: string | null;
        username: string | null;
    };
    type: string;
    coverImageUrl: string | null;
    exportId: string | null;
    createdAt: Date;
    reactions: {
        like: number;
        lol: number;
        vibe: number;
    };
    stickers: StorySticker[];
    remixMetadata?: {
        parentStoryId: string;
        parentAuthor: {
            id: string;
            name: string | null;
            username: string | null;
        };
        remixType: string;
    } | null;
}
export interface StoryFeedResponse {
    stories: StoryFeedItem[];
    nextCursor: string | null;
}
/**
 * Get public stories feed
 */
export declare function getPublicStoriesFeed(params?: StoryFeedParams): Promise<StoryFeedResponse>;
/**
 * Add or remove story reaction (toggle for standard reactions, add for stickers)
 */
export declare function handleStoryReaction(userId: string, storyId: string, type: string, action?: 'toggle' | 'add'): Promise<{
    reactions: {
        like: number;
        lol: number;
        vibe: number;
    };
    stickers: StorySticker[];
}>;
/**
 * Get reaction and sticker summary for a story
 */
export declare function getStoryReactionSummary(storyId: string): Promise<{
    reactions: {
        like: number;
        lol: number;
        vibe: number;
    };
    stickers: StorySticker[];
}>;
/**
 * Legacy function for backward compatibility
 */
export declare function toggleStoryReaction(userId: string, storyId: string, type: 'like' | 'lol' | 'vibe'): Promise<{
    like: number;
    lol: number;
    vibe: number;
}>;
/**
 * Publish story with visibility setting
 */
export declare function publishStory(userId: string, storyId: string, visibility: StoryVisibility): Promise<{
    id: string;
    visibility: string;
    publishedAt: Date | null;
}>;
/**
 * Update story visibility
 */
export declare function updateStoryVisibility(userId: string, storyId: string, visibility: StoryVisibility): Promise<{
    id: string;
    visibility: string;
    publishedAt: Date | null;
}>;
/**
 * Get user's own stories
 */
export declare function getUserStories(userId: string): Promise<Array<{
    id: string;
    type: string;
    coverImageUrl: string | null;
    visibility: string;
    publishedAt: Date | null;
    createdAt: Date;
}>>;
