/** @parel/story stub - build resolution only */
export declare function incrementStoryView(storyId: string, userId?: string | null): Promise<number>;
export declare function getStoryAnalytics(storyId: string): Promise<{
  viewCount: number;
  reactions: { like: number; lol: number; vibe: number };
  stickers: Array<{ id: string; emoji: string; count: number }>;
  reachScore: number;
  inChallenges: string[];
}>;
