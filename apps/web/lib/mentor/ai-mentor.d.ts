/**
 * AI Mentor System (v0.9.5)
 *
 * PLACEHOLDER: Personalized growth guidance and reflection system.
 */
export interface WeeklySummary {
    timeframe: string;
    dominantTrait: string;
    highlights: string[];
    growthAreas: string[];
    suggestions: string[];
    metrics: {
        xpGained: number;
        flowsCompleted: number;
        socialInteractions: number;
        achievementsUnlocked: number;
    };
}
export interface MentorTone {
    tone: "supportive" | "challenging" | "philosophical" | "casual";
    name: string;
    description: string;
    exampleMessage: string;
}
export declare const MENTOR_TONES: MentorTone[];
export interface ReflectionPrompt {
    promptId: string;
    category: string;
    question: string;
    subtext?: string;
    icon: string;
    archetypes: string[];
}
export declare const REFLECTION_PROMPTS: ReflectionPrompt[];
/**
 * Generate weekly summary for user
 */
export declare function generateWeeklySummary(userActivity: {
    xpGained: number;
    flowsCompleted: number;
    socialInteractions: number;
    achievementsUnlocked: number;
    dominantStat: string;
}): WeeklySummary;
/**
 * PLACEHOLDER: Generate personalized mentor message
 */
export declare function generateMentorMessage(userId: string, messageType: "weekly_summary" | "suggestion" | "reflection" | "milestone"): Promise<null>;
/**
 * PLACEHOLDER: Analyze reflection entry
 */
export declare function analyzeReflection(reflectionId: string, content: string): Promise<null>;
/**
 * PLACEHOLDER: Get personalized flow recommendations
 */
export declare function getFlowRecommendations(userId: string): Promise<never[]>;
