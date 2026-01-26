/**
 * Shared Selectors
 * Selector utilities for state management
 * v0.41.16 - C3 Step 17: Unified State Management Foundation
 */
/**
 * Select async state from store
 */
export function selectAsyncState(store) {
    return store.state;
}
/**
 * Select data from async store
 */
export function selectData(store) {
    return store.state.data;
}
/**
 * Select loading state
 */
export function selectLoading(store) {
    return store.state.loading;
}
/**
 * Select error state
 */
export function selectError(store) {
    return store.state.error;
}
/**
 * Select whether data is loaded (has data and not loading)
 */
export function selectIsLoaded(store) {
    return !store.state.loading && store.state.data !== null && store.state.error === null;
}
/**
 * Select whether store is in error state
 */
export function selectHasError(store) {
    return store.state.error !== null;
}
/**
 * Create memoized selector
 * Simple memoization for selector functions
 */
export function createSelector(selector) {
    let lastState = null;
    let lastResult = null;
    return (state) => {
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
export function combineSelectors(...selectors) {
    return (state) => {
        return selectors.map((selector) => selector(state));
    };
}
/**
 * Selector with default value
 */
export function selectWithDefault(selector, defaultValue) {
    return (state) => {
        const result = selector(state);
        return result ?? defaultValue;
    };
}
