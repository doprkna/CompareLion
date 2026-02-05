export declare function useLatestCard(): {
    card: any;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function useGenerateCard(): {
    generate: () => Promise<any>;
    loading: boolean;
    error: string | null;
};
