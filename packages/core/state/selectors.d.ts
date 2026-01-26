/**
 * Shared Selectors
 * Selector utilities for state management
 * v0.41.16 - C3 Step 17: Unified State Management Foundation
 */
import type { Selector, AsyncState } from './types';
import type { AsyncStore } from './store';
/**
 * Select async state from store
 */
export declare function selectAsyncState<T>(store: AsyncStore<T>): AsyncState<T>;
/**
 * Select data from async store
 */
export declare function selectData<T>(store: AsyncStore<T>): T | null;
/**
 * Select loading state
 */
export declare function selectLoading<T>(store: AsyncStore<T>): boolean;
/**
 * Select error state
 */
export declare function selectError<T>(store: AsyncStore<T>): string | null;
/**
 * Select whether data is loaded (has data and not loading)
 */
export declare function selectIsLoaded<T>(store: AsyncStore<T>): boolean;
/**
 * Select whether store is in error state
 */
export declare function selectHasError<T>(store: AsyncStore<T>): boolean;
/**
 * Create memoized selector
 * Simple memoization for selector functions
 */
export declare function createSelector<TState, TResult>(selector: Selector<TState, TResult>): Selector<TState, TResult>;
/**
 * Combine multiple selectors
 */
export declare function combineSelectors<TState, TResults extends readonly any[]>(...selectors: {
    [K in keyof TResults]: Selector<TState, TResults[K]>;
}): Selector<TState, TResults>;
/**
 * Selector with default value
 */
export declare function selectWithDefault<TState, TResult>(selector: Selector<TState, TResult | null | undefined>, defaultValue: TResult): Selector<TState, TResult>;
