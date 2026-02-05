export declare function useRarities(): {
    rarities: any;
    loading: any;
    error: any;
    reload: any;
};
export declare function useSeedRarities(): {
    seed: () => Promise<any>;
    loading: boolean;
    error: string | null;
};
