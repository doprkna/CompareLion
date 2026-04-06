/**
 * Navigation Utilities
 * v0.34.5 - Keyboard shortcuts and gesture-based navigation
 */
export type NavigationAction = 'back' | 'forward' | 'home' | 'refresh' | 'theme_toggle';
export interface KeyboardShortcut {
    key: string;
    action: NavigationAction;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
}
/**
 * Default keyboard shortcuts
 */
export declare const DEFAULT_SHORTCUTS: KeyboardShortcut[];
/**
 * Check if keyboard event matches a shortcut
 */
export declare function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean;
/**
 * Get navigation action from keyboard event
 */
export declare function getNavigationAction(event: KeyboardEvent): NavigationAction | null;
/**
 * Execute navigation action
 */
export declare function executeNavigationAction(action: NavigationAction, router?: {
    back: () => void;
    push: (path: string) => void;
    refresh: () => void;
}): void;
/**
 * Mobile gesture detection
 */
export interface SwipeGesture {
    direction: 'left' | 'right' | 'up' | 'down';
    distance: number;
    duration: number;
}
/**
 * Detect swipe gesture from touch events
 */
export declare class SwipeDetector {
    private startX;
    private startY;
    private startTime;
    private threshold;
    private maxDuration;
    onTouchStart(event: TouchEvent): void;
    onTouchEnd(event: TouchEvent, callback: (gesture: SwipeGesture) => void): void;
}
/**
 * Page transition configurations
 */
export declare const PAGE_TRANSITIONS: {
    fade: {
        initial: {
            opacity: number;
        };
        animate: {
            opacity: number;
        };
        exit: {
            opacity: number;
        };
        transition: {
            duration: number;
        };
    };
    slide: {
        initial: {
            x: number;
            opacity: number;
        };
        animate: {
            x: number;
            opacity: number;
        };
        exit: {
            x: number;
            opacity: number;
        };
        transition: {
            duration: number;
            ease: string;
        };
    };
    slideUp: {
        initial: {
            y: number;
            opacity: number;
        };
        animate: {
            y: number;
            opacity: number;
        };
        exit: {
            y: number;
            opacity: number;
        };
        transition: {
            duration: number;
            ease: string;
        };
    };
};
/**
 * Get default transition for page type
 */
export declare function getPageTransition(pageType?: 'default' | 'modal' | 'admin'): {
    initial: {
        opacity: number;
    };
    animate: {
        opacity: number;
    };
    exit: {
        opacity: number;
    };
    transition: {
        duration: number;
    };
};
