/**
 * usePolls Hook
 * Fetches polls, individual polls, and challenges
 * v0.41.14 - Migrated useChallenges GET call to unified API client
 */
export declare function usePolls(region?: string | null): {
    polls: any;
    loading: any;
    error: any;
    reload: any;
};
export declare function usePoll(id: string | null): {
    poll: any;
    stats: any;
    loading: any;
    error: any;
    reload: any;
};
export declare function useChallenges(region?: string | null): {
    challenges: any;
    loading: any;
    error: any;
    reload: any;
};
