export interface Feedback {
    id: string;
    userId?: string | null;
    user?: {
        id: string;
        username: string | null;
        name: string | null;
    } | null;
    message: string;
    screenshotUrl?: string | null;
    context?: string | null;
    status: 'NEW' | 'REVIEWED' | 'RESOLVED';
    createdAt: string;
    reviewedAt?: string | null;
    reviewedBy?: string | null;
}
interface SubmitFeedbackData {
    message: string;
    screenshotUrl?: string;
    context?: string;
}
interface SubmitFeedbackResult {
    success: boolean;
    feedback: {
        id: string;
        status: string;
        createdAt: string;
    };
    message: string;
}
export declare function useFeedback(): {
    submitFeedback: (data: SubmitFeedbackData) => Promise<SubmitFeedbackResult>;
    loading: boolean;
    error: string | null;
};
export {};
