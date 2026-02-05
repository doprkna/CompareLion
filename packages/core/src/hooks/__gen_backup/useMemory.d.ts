export declare function useLatestMemory(): {
    entry: any;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function useMemoryArchive(): {
    entries: any[];
    nextCursor: string | undefined;
    loading: boolean;
    error: string | null;
    loadMore: () => Promise<void> | undefined;
    reload: () => Promise<void>;
};
export declare function useGenerateMemory(): {
    generate: () => Promise<any>;
    loading: boolean;
    error: string | null;
};
