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
export declare function useFeedback(): {
    submitFeedback: any;
    loading: any;
    error: any;
};
