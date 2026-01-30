/**
 * useKeyboardNavigation Hook
 * v0.34.5 - Global keyboard shortcuts for navigation
 */
export type NavigationAction = 'home' | 'back' | 'forward' | 'refresh' | 'search' | 'theme_toggle' | 'help';
export interface UseKeyboardNavigationOptions {
    enabled?: boolean;
    onThemeToggle?: () => void;
    onCustomAction?: (action: NavigationAction) => void;
}
/**
 * Hook for global keyboard navigation
 */
export declare function useKeyboardNavigation(options?: UseKeyboardNavigationOptions): void;
