/**
 * Story Draft Service
 * Handle story drafts and publishing
 * v0.40.13 - Story Drafts 1.0
 */
export type StoryStatus = 'draft' | 'published';
export type StoryVisibility = 'public' | 'private' | 'friends';
/**
 * Publish draft story
 */
export declare function publishDraftStory(userId: string, storyId: string, visibility: StoryVisibility): Promise<{
    id: string;
    status: StoryStatus;
    visibility: StoryVisibility;
    publishedAt: Date;
}>;
/**
 * Update draft story metadata
 */
export declare function updateDraftStoryMetadata(userId: string, storyId: string, data: {
    title?: string;
}): Promise<{
    id: string;
    title: string | null;
}>;
/**
 * Get user's draft stories
 */
export declare function getUserDraftStories(userId: string): Promise<Array<{
    id: string;
    type: string;
    title: string | null;
    coverImageUrl: string | null;
    createdAt: Date;
    updatedAt: Date | null;
}>>;
