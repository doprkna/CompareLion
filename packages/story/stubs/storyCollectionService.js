/** @parel/story stub - build resolution only */
const STUB_MSG = '@parel/story stub: story not built. Replace with real implementation.';

export async function createStoryCollection(userId, data) {
  throw new Error(STUB_MSG);
}

export async function addStoryToCollection(collectionId, storyId, userId) {
  throw new Error(STUB_MSG);
}

export async function removeStoryFromCollection(collectionId, storyId, userId) {
  throw new Error(STUB_MSG);
}

export async function getCollection(collectionId) {
  throw new Error(STUB_MSG);
}

export async function getUserCollections(userId) {
  throw new Error(STUB_MSG);
}
