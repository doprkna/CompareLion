/**
 * Lightweight client-side counter to trigger reflection modal
 * after N comparisons. Debounced to avoid spam.
 */
export declare function useReflectionPrompt(min?: number, max?: number): {
    open: any;
    close: any;
    triggerIfNeeded: any;
};
