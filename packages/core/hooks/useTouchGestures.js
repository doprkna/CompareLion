'use client';
// sanity-fix
'use client';
import { useEffect, useState } from 'react';
/**
 * Custom hook for touch gestures
 */
export function useTouchGestures(ref, options = {}) {
    const { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPullToRefresh, threshold = 50, pullThreshold = 80, } = options;
    const [touchState, setTouchState] = useState({
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        isPulling: false,
        pullDistance: 0,
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    useEffect(() => {
        const element = ref.current;
        if (!element)
            return;
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let startScrollTop = 0;
        const handleTouchStart = (e) => {
            if (!e.touches || e.touches.length === 0) return; // sanity-fix
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startScrollTop = element.scrollTop;
            setTouchState((prev) => ({
                ...prev,
                startX,
                startY,
            }));
        };
        const handleTouchMove = (e) => {
            if (!e.touches || e.touches.length === 0) return; // sanity-fix
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
            setTouchState((prev) => ({
                ...prev,
                currentX,
                currentY,
            }));
            // Check for pull-to-refresh
            if (onPullToRefresh && element.scrollTop === 0 && startScrollTop === 0) {
                const pullDistance = currentY - startY;
                if (pullDistance > 0) {
                    e.preventDefault();
                    setTouchState((prev) => ({
                        ...prev,
                        isPulling: true,
                        pullDistance,
                    }));
                }
            }
        };
        const handleTouchEnd = async () => {
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);
            // Check for swipe gestures
            if (absDeltaX > absDeltaY && absDeltaX > threshold) {
                // Horizontal swipe
                if (deltaX > 0) {
                    onSwipeRight?.();
                }
                else {
                    onSwipeLeft?.();
                }
            }
            else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
                // Vertical swipe
                if (deltaY > 0) {
                    onSwipeDown?.();
                }
                else {
                    onSwipeUp?.();
                }
            }
            // Check for pull-to-refresh
            if (touchState.isPulling && touchState.pullDistance > pullThreshold && onPullToRefresh) {
                setIsRefreshing(true);
                try {
                    await onPullToRefresh();
                }
                finally {
                    setIsRefreshing(false);
                }
            }
            // Reset state
            setTouchState({
                startX: 0,
                startY: 0,
                currentX: 0,
                currentY: 0,
                isPulling: false,
                pullDistance: 0,
            });
        };
        element.addEventListener('touchstart', handleTouchStart, { passive: false });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd);
        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [
        ref,
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown,
        onPullToRefresh,
        threshold,
        pullThreshold,
        touchState.isPulling,
        touchState.pullDistance,
    ]);
    return {
        isPulling: touchState.isPulling,
        pullDistance: touchState.pullDistance,
        isRefreshing,
    };
}
/**
 * Hook for detecting swipe gestures only
 */
export function useSwipeGesture(ref, onSwipe, threshold = 50) {
    return useTouchGestures(ref, {
        onSwipeLeft: () => onSwipe('left'),
        onSwipeRight: () => onSwipe('right'),
        onSwipeUp: () => onSwipe('up'),
        onSwipeDown: () => onSwipe('down'),
        threshold,
    });
}
/**
 * Hook for pull-to-refresh only
 */
export function usePullToRefresh(ref, onRefresh, pullThreshold = 80) {
    return useTouchGestures(ref, {
        onPullToRefresh: onRefresh,
        pullThreshold,
    });
}