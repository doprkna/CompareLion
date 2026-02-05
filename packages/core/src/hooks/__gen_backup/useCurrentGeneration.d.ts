export declare function useCurrentGeneration(): {
    current: any;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
