/** @parel/story stub - build resolution only */
export type StoryVisibility = 'public' | 'private' | 'friends';
export declare function updateStoryVisibility(
  userId: string,
  storyId: string,
  visibility: StoryVisibility
): Promise<unknown>;
export declare function getStoryReactionSummary(storyId: string): Promise<unknown>;
export declare function handleStoryReaction(
  userId: string,
  storyId: string,
  type: string
): Promise<unknown>;
export declare function publishStory(
  userId: string,
  storyId: string,
  visibility: StoryVisibility
): Promise<unknown>;
export declare function getUserStories(userId: string): Promise<unknown[]>;
export declare function getPublicStoriesFeed(params?: unknown): Promise<unknown>;
