/**
 * React Performance Utilities (v0.11.1)
 * 
 * Memoization and optimization helpers.
 */

'use client';

import { memo, useMemo, useCallback } from "react";

/**
 * Memoized list item wrapper
 */
export const MemoizedListItem = memo(function ListItem<T extends { id: string }>({
  item,
  renderItem,
}: {
  item: T;
  renderItem: (item: T) => React.ReactNode;
}) {
  return <>{renderItem(item)}</>;
});

/**
 * Hook for stable sort function
 */
export function useSortedData<T>(
  data: T[],
  sortFn: (a: T, b: T) => number
): T[] {
  return useMemo(() => [...data].sort(sortFn), [data, sortFn]);
}

/**
 * Hook for filtered data
 */
export function useFilteredData<T>(
  data: T[],
  filterFn: (item: T) => boolean
): T[] {
  return useMemo(() => data.filter(filterFn), [data, filterFn]);
}

/**
 * Hook for paginated data client-side
 */
export function usePaginatedData<T>(
  data: T[],
  page: number,
  pageSize: number
): {
  items: T[];
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  return useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = data.slice(start, end);
    const totalPages = Math.ceil(data.length / pageSize);
    
    return {
      items,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }, [data, page, pageSize]);
}

/**
 * Debounced callback hook
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useCallback(
    (() => {
      let timeout: NodeJS.Timeout | null = null;
      return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => callback(...args), delay);
      };
    })(),
    [callback, delay]
  );
  
  return timeoutRef;
}

/**
 * Throttled callback hook
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  return useCallback(
    (() => {
      let lastRun = 0;
      return (...args: Parameters<T>) => {
        const now = Date.now();
        if (now - lastRun >= delay) {
          callback(...args);
          lastRun = now;
        }
      };
    })(),
    [callback, delay]
  );
}

/**
 * Intersection observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useMemo(() => {
    if (typeof IntersectionObserver === "undefined") return [false, () => {}];
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    return [false, (value: boolean) => {}];
  }, [options]);
  
  return isIntersecting;
}

/**
 * Performance markers for measurement
 */
export class PerformanceMarker {
  private marks: Map<string, number> = new Map();
  
  mark(name: string) {
    this.marks.set(name, performance.now());
  }
  
  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();
    
    if (!start || !end) return 0;
    
    const duration = end - start;
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    
    return duration;
  }
  
  clear() {
    this.marks.clear();
  }
}

/**
 * Virtual scroll helper for large lists
 */
export function useVirtualScroll<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number
): {
  visibleItems: T[];
  totalHeight: number;
  offsetY: number;
} {
  const [scrollTop, setScrollTop] = useMemo(() => [0, (value: number) => {}], []);
  
  return useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight)
    );
    
    const visibleItems = items.slice(startIndex, endIndex);
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;
    
    return { visibleItems, totalHeight, offsetY };
  }, [items, scrollTop, containerHeight, itemHeight]);
}










