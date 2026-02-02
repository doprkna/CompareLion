/** @parel/story stub - build resolution only */
export interface StoryCollectionData {
  name: string;
  description: string;
  isPublic: boolean;
}
export declare function createStoryCollection(
  userId: string,
  data: StoryCollectionData
): Promise<unknown>;
export declare function addStoryToCollection(
  collectionId: string,
  storyId: string,
  userId: string
): Promise<unknown>;
export declare function removeStoryFromCollection(
  collectionId: string,
  storyId: string,
  userId: string
): Promise<unknown>;
export declare function getCollection(collectionId: string): Promise<unknown>;
export declare function getUserCollections(userId: string): Promise<unknown[]>;
