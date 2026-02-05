export declare function useCheckWildcard(): {
    check: (triggerType: "xpGain" | "login" | "reflection" | "random") => Promise<any>;
    loading: boolean;
    error: string | null;
};
