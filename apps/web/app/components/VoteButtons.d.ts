/**
 * Vote Buttons Component
 * Upvote/downvote buttons for answers
 * v0.37.11 - Upvote / Downvote Answers
 */
interface VoteButtonsProps {
    answerId: string;
    initialScore?: number;
    initialUserVote?: 1 | -1 | null;
    className?: string;
    onVoteChange?: (score: number, userVote: 1 | -1 | null) => void;
}
export declare function VoteButtons({ answerId, initialScore, initialUserVote, className, onVoteChange, }: VoteButtonsProps): import("react").JSX.Element;
export {};
