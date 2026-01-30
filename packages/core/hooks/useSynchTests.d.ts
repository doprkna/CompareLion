export declare function useSynchTests(): {
    tests: any[];
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function useStartSynchTest(): {
    start: (testId: string, targetUserId?: string) => Promise<any>;
    loading: boolean;
    error: string | null;
};
export declare function useSynchResult(id: string | null): {
    result: any;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
