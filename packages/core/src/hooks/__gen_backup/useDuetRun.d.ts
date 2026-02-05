export declare function useDuetRun(): {
    duetRun: any;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function useStartDuetRun(): {
    start: (missionKey: string, partnerId?: string) => Promise<any>;
    loading: boolean;
    error: string | null;
};
export declare function useDuetProgress(): {
    updateProgress: (duetRunId: string, progress: number) => Promise<any>;
    complete: (duetRunId: string) => Promise<any>;
    loading: boolean;
    error: string | null;
};
