/** @parel/story stub - build resolution only */
export type StoryVisibility = 'public' | 'private' | 'friends';
export declare function publishDraftStory(
  userId: string,
  storyId: string,
  visibility: StoryVisibility
): Promise<unknown>;
export declare function updateDraftStoryMetadata(
  userId: string,
  storyId: string,
  data: Record<string, unknown>
): Promise<unknown>;
export declare function getUserDraftStories(userId: string): Promise<unknown[]>;
