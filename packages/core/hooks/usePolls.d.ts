export declare function usePolls(region?: string | null): {
    polls: any[];
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function usePoll(id: string | null): {
    poll: any;
    stats: any;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function useChallenges(region?: string | null): {
    challenges: any[];
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
