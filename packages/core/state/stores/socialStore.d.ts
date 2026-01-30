/**
 * Social Store
 * Zustand store for social interactions (friends, duels, feed, mutations)
 * v0.41.20 - C3 Step 21: State Migration Batch #4
 */
export interface Friend {
    id: string;
    username: string | null;
    name: string | null;
    archetype: string | null;
    level: number;
    avatar: string | null;
    friendshipId: string;
    since: string;
}
export interface Duel {
    id: string;
    challengerId: string;
    opponentId: string;
    challenger?: {
        id: string;
        username: string | null;
        level: number;
    };
    opponent?: {
        id: string;
        username: string | null;
        level: number;
    };
    status: 'pending' | 'active' | 'completed' | 'expired';
    challengeType: 'xp' | 'reflection' | 'random' | 'poll';
    rewardXP: number;
    winnerId?: string | null;
    createdAt: string;
}
export interface FeedItem {
    type: 'badge' | 'duel' | 'quest';
    userId: string;
    username: string;
    data: any;
    timestamp: string;
}
export declare const useFriendsStore: any;
export declare const useDuelsStore: any;
export declare const useSocialFeedStore: any;
export declare const useFriendRequestStore: any;
export declare const useStartDuelStore: any;
