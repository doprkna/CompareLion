import type { Friend, Duel, FeedItem } from '../state/stores/socialStore';
export type { Friend, Duel, FeedItem };
export interface SharedMission {
    id: string;
    missionKey: string;
    participants: string[];
    status: 'active' | 'completed' | 'expired';
    rewardXP: number;
    createdAt: string;
    completedAt?: string | null;
}
/**
 * useSocial Hooks
 * v0.41.20 - Migrated to unified state store
 */
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
