import { RefObject } from 'react';
interface TouchGestureOptions {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onPullToRefresh?: () => Promise<void>;
    threshold?: number;
    pullThreshold?: number;
}
/**
 * Custom hook for touch gestures
 */
export declare function useTouchGestures(ref: RefObject<HTMLElement>, options?: TouchGestureOptions): {
    isPulling: boolean;
    pullDistance: number;
    isRefreshing: boolean;
};
/**
 * Hook for detecting swipe gestures only
 */
export declare function useSwipeGesture(ref: RefObject<HTMLElement>, onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void, threshold?: number): {
    isPulling: boolean;
    pullDistance: number;
    isRefreshing: boolean;
};
/**
 * Hook for pull-to-refresh only
 */
export declare function usePullToRefresh(ref: RefObject<HTMLElement>, onRefresh: () => Promise<void>, pullThreshold?: number): {
    isPulling: boolean;
    pullDistance: number;
    isRefreshing: boolean;
};
export {};
