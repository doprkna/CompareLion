/**
 * Question Tags Component
 * Displays hashtags as pill-style labels
 * v0.37.7 - Hashtag Filtering
 */
interface QuestionTagsProps {
    tags?: string[] | null;
    onClick?: (tag: string) => void;
    className?: string;
}
export declare function QuestionTags({ tags, onClick, className }: QuestionTagsProps): import("react").JSX.Element | null;
export {};
