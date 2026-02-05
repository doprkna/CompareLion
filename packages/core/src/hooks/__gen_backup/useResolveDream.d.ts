export declare function useResolveDream(): {
    resolve: (userDreamId: string) => Promise<any>;
    loading: boolean;
    error: string | null;
};
