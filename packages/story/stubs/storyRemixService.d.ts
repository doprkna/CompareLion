/** @parel/story stub - build resolution only */
export declare function getStoryPanels(storyId: string): Promise<unknown>;
export declare function getRemixMetadata(storyId: string): Promise<unknown>;
export declare function createRemixStory(
  userId: string,
  parentStoryId: string,
  remixType: string,
  input: unknown
): Promise<unknown>;
export declare function getRemixCount(parentStoryId: string): Promise<number>;
