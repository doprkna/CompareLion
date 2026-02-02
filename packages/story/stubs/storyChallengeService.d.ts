/** @parel/story stub - build resolution only */
export declare function getActiveStoryChallenges(): Promise<unknown[]>;
export declare function submitStoryToChallenge(
  challengeId: string,
  storyId: string,
  userId: string
): Promise<unknown>;
export declare function getChallengeEntries(challengeId: string): Promise<unknown[]>;
