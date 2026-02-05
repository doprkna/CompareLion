type MoodKey = 'chill' | 'deep' | 'roast';
export declare function useMoodFeed(): {
    mood: MoodKey;
    setMood: (m: MoodKey) => Promise<void>;
    applyTone: (text: string, variant?: "short" | "long") => string;
    tokens: {
        bgAccent: string;
        toast: string;
        anim: number;
    } | {
        bgAccent: string;
        toast: string;
        anim: number;
    } | {
        bgAccent: string;
        toast: string;
        anim: number;
    };
    saving: boolean;
};
export {};
