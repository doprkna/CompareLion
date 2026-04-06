/**
 * Story Challenge Service
 * Handles story challenges and entries
 * v0.40.8 - Story Challenges 1.0 (Community Story Prompts)
 */
export interface StoryChallenge {
    id: string;
    title: string;
    description: string;
    promptType: 'image' | 'story' | 'extended';
    startAt: Date;
    endAt: Date;
    isActive: boolean;
    createdAt: Date;
}
export interface ChallengeEntry {
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
 * Get active and upcoming story challenges
 * Auto-deactivates expired challenges (lazy)
 */
export declare function getActiveStoryChallenges(): Promise<StoryChallenge[]>;
/**
 * Submit story to challenge
 */
export declare function submitStoryToChallenge(userId: string, storyId: string, challengeId: string): Promise<void>;
/**
 * Get challenge entries with story details
 */
export declare function getChallengeEntries(challengeId: string): Promise<ChallengeEntry[]>;
