export declare function useDreamTrigger(): {
    trigger: (triggerType?: "sleep" | "reflection" | "random") => Promise<any>;
    loading: boolean;
    error: string | null;
};
