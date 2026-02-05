export declare function useFusionOptions(): {
    data: {
        base?: string;
        options: any[];
    } | null;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function useArchetypeFusion(): {
    fuse: (baseA: string, baseB: string) => Promise<any>;
    loading: boolean;
    error: string | null;
};
