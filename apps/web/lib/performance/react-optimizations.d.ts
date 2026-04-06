/**
 * React Performance Utilities (v0.11.1)
 *
 * Memoization and optimization helpers.
 */
/**
 * Memoized list item wrapper
 */
export declare const MemoizedListItem: import("react").MemoExoticComponent<(<T extends {
    id: string;
}>({ item, renderItem, }: {
    item: T;
    renderItem: (item: T) => React.ReactNode;
}) => import("react").JSX.Element)>;
/**
 * Hook for stable sort function
 */
export declare function useSortedData<T>(data: T[], sortFn: (a: T, b: T) => number): T[];
/**
 * Hook for filtered data
 */
export declare function useFilteredData<T>(data: T[], filterFn: (item: T) => boolean): T[];
/**
 * Hook for paginated data client-side
 */
export declare function usePaginatedData<T>(data: T[], page: number, pageSize: number): {
    items: T[];
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};
/**
 * Debounced callback hook
 */
export declare function useDebouncedCallback<T extends (...args: any[]) => any>(callback: T, delay: number): (...args: Parameters<T>) => void;
/**
 * Throttled callback hook
 */
export declare function useThrottledCallback<T extends (...args: any[]) => any>(callback: T, delay: number): (...args: Parameters<T>) => void;
/**
 * Intersection observer hook for lazy loading
 */
export declare function useIntersectionObserver(ref: React.RefObject<Element>, options?: IntersectionObserverInit): boolean;
/**
 * Performance markers for measurement
 */
export declare class PerformanceMarker {
    private marks;
    mark(name: string): void;
    measure(name: string, startMark: string, endMark?: string): number;
    clear(): void;
}
/**
 * Virtual scroll helper for large lists
 */
export declare function useVirtualScroll<T>(items: T[], containerHeight: number, itemHeight: number): {
    visibleItems: T[];
    totalHeight: number;
    offsetY: number;
};
