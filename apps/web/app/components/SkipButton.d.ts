/**
 * Skip Button Component
 * Skip a question
 * v0.37.2 - Skip Question Feature
 */
interface SkipButtonProps {
    questionId: string;
    onSkip?: () => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'outline' | 'ghost';
}
export declare function SkipButton({ questionId, onSkip, className, size, variant }: SkipButtonProps): import("react").JSX.Element;
export {};
