export declare function useAscend(): {
    ascend: (inheritedPerks: Array<{
        type: string;
        value: string | number;
    }>) => Promise<any>;
    loading: boolean;
    error: string | null;
};
