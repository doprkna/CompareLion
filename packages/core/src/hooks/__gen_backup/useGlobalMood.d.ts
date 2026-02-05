export declare function useGlobalMood(): {
    mood: any;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function useMoodTheme(mood: any | null): {
    theme: any;
    moodText: string;
    dominantEmotion: any;
};
