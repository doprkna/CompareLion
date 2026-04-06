/**
 * Bookmark Button Component
 * Toggle bookmark for a question
 * v0.37.1 - Bookmark Question Feature
 */
interface BookmarkButtonProps {
    questionId: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}
export declare function BookmarkButton({ questionId, className, size }: BookmarkButtonProps): import("react").JSX.Element;
export {};
