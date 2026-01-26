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
export interface SharedMission {
    id: string;
    missionKey: string;
    participants: string[];
    status: 'active' | 'completed' | 'expired';
    rewardXP: number;
    createdAt: string;
    completedAt?: string | null;
}
import type { Friend, Duel, FeedItem } from '../state/stores/socialStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
export type { Friend, Duel, FeedItem };
export declare function useFriends(): {
    friends: any;
    loading: any;
    error: any;
    reload: any;
};
export declare function useDuels(): {
    duels: any;
    loading: any;
    error: any;
    reload: any;
};
export declare function useSocialFeed(): {
    feed: any;
    loading: any;
    error: any;
    reload: any;
};
export declare function useFriendRequest(): {
    sendRequest: any;
    loading: any;
    error: any;
};
export declare function useStartDuel(): {
    startDuel: any;
    loading: any;
    error: any;
};
