import { type NavigationAction } from './navigation';
export interface UseKeyboardNavigationOptions {
    enabled?: boolean;
    onThemeToggle?: () => void;
    onCustomAction?: (action: NavigationAction) => void;
}
/**
 * Hook for global keyboard navigation
 */
export declare function useKeyboardNavigation(options?: UseKeyboardNavigationOptions): void;
