/**
 * Error Placeholder Component
 *
 * Displays user-friendly error messages with optional retry functionality
 * Shows additional debug info in development mode
 */
interface ErrorPlaceholderProps {
    title: string;
    message?: string;
    retry?: () => void;
}
export declare function ErrorPlaceholder({ title, message, retry }: ErrorPlaceholderProps): import("react").JSX.Element;
/**
 * Simple error message without retry
 */
export declare function ErrorMessage({ children }: {
    children: React.ReactNode;
}): import("react").JSX.Element;
/**
 * Loading skeleton placeholder
 */
export declare function LoadingPlaceholder({ message }: {
    message?: string;
}): import("react").JSX.Element;
export {};
