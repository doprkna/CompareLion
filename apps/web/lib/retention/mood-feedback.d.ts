/**
 * Mood Feedback System (v0.11.9)
 *
 * PLACEHOLDER: Collect and analyze user mood for AI Mentor insights.
 */
export declare const MOOD_EMOJIS: {
    readonly EXCITED: {
        readonly emoji: "🤩";
        readonly rating: 5;
        readonly sentiment: 1;
    };
    readonly HAPPY: {
        readonly emoji: "😊";
        readonly rating: 4;
        readonly sentiment: 0.5;
    };
    readonly NEUTRAL: {
        readonly emoji: "😐";
        readonly rating: 3;
        readonly sentiment: 0;
    };
    readonly SAD: {
        readonly emoji: "😞";
        readonly rating: 2;
        readonly sentiment: -0.5;
    };
    readonly ANGRY: {
        readonly emoji: "😡";
        readonly rating: 1;
        readonly sentiment: -1;
    };
};
/**
 * Record mood feedback
 */
export declare function recordMoodFeedback(_userId: string, _emoji: string, _context?: string, _comment?: string): Promise<null>;
/**
 * Get mood trends for user
 */
export declare function getUserMoodTrends(_userId: string, _days?: number): Promise<null>;
