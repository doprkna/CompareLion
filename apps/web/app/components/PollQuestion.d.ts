/**
 * Poll Question Component
 * Display poll options and handle voting
 * v0.37.4 - Poll Option Feature
 */
interface PollQuestionProps {
    questionId: string;
    className?: string;
}
export declare function PollQuestion({ questionId, className }: PollQuestionProps): import("react").JSX.Element | null;
export {};
