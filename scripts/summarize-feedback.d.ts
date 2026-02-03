/**
 * Feedback Summarization Script
 * Analyzes feedback and generates markdown summary
 * v0.13.2l - Feedback Review System
 */
interface FeedbackSummary {
    total: number;
    byCategory: {
        bug: number;
        idea: number;
        praise: number;
    };
    byStatus: {
        pending: number;
        reviewed: number;
        in_progress: number;
        resolved: number;
    };
    topThemes: {
        bugs: string[];
        features: string[];
        praise: string[];
    };
    examples: {
        bugs: Array<{
            title: string;
            description: string;
        }>;
        ideas: Array<{
            title: string;
            description: string;
        }>;
        praise: Array<{
            title: string;
            description: string;
        }>;
    };
}
/**
 * Main summarization function
 */
declare function summarizeFeedback(): Promise<FeedbackSummary>;
export { summarizeFeedback };
