export declare function useGenerateShare(): {
    generate: (type: "weekly" | "achievement" | "comparison") => Promise<any>;
    loading: boolean;
    error: string | null;
};
