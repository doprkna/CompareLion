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
export function selectAsyncState<T>(store: AsyncStore<T>): AsyncState<T> {
  return store.state;
}

/**
 * Select data from async store
 */
export function selectData<T>(store: AsyncStore<T>): T | null {
  return store.state.data;
}

/**
 * Select loading state
 */
export function selectLoading<T>(store: AsyncStore<T>): boolean {
  return store.state.loading;
}

/**
 * Select error state
 */
export function selectError<T>(store: AsyncStore<T>): string | null {
  return store.state.error;
}

/**
 * Select whether data is loaded (has data and not loading)
 */
export function selectIsLoaded<T>(store: AsyncStore<T>): boolean {
  return !store.state.loading && store.state.data !== null && store.state.error === null;
}

/**
 * Select whether store is in error state
 */
export function selectHasError<T>(store: AsyncStore<T>): boolean {
  return store.state.error !== null;
}

/**
 * Create memoized selector
 * Simple memoization for selector functions
 */
export function createSelector<TState, TResult>(
  selector: Selector<TState, TResult>
): Selector<TState, TResult> {
  let lastState: TState | null = null;
  let lastResult: TResult | null = null;

  return (state: TState): TResult => {
    if (state === lastState && lastResult !== null) {
      return lastResult;
    }
    lastState = state;
    lastResult = selector(state);
    return lastResult;
  };
}

/**
 * Combine multiple selectors
 */
export function combineSelectors<TState, TResults extends readonly any[]>(
  ...selectors: { [K in keyof TResults]: Selector<TState, TResults[K]> }
): Selector<TState, TResults> {
  return (state: TState): TResults => {
    return selectors.map((selector) => selector(state)) as TResults;
  };
}

/**
 * Selector with default value
 */
export function selectWithDefault<TState, TResult>(
  selector: Selector<TState, TResult | null | undefined>,
  defaultValue: TResult
): Selector<TState, TResult> {
  return (state: TState): TResult => {
    const result = selector(state);
    return result ?? defaultValue;
  };
}

