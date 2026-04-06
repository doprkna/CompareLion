/**
 * Global Loading Spinner
 *
 * Shows a full-screen loading spinner for longer operations
 * - Delayed appearance (200ms) to avoid flash for quick loads
 * - Semi-transparent backdrop
 * - Accessible and keyboard-friendly
 */
interface GlobalSpinnerProps {
    delay?: number;
    message?: string;
}
export declare function GlobalSpinner({ delay, message }: GlobalSpinnerProps): import("react").JSX.Element | null;
/**
 * Simple inline spinner
 */
export declare function InlineSpinner({ size }: {
    size?: "sm" | "md" | "lg";
}): import("react").JSX.Element;
/**
 * Button spinner (for loading buttons)
 */
export declare function ButtonSpinner(): import("react").JSX.Element;
/**
 * Loading dots animation
 */
export declare function LoadingDots(): import("react").JSX.Element;
export {};
