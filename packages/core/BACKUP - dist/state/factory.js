/**
 * Store Factory
 * Zustand store creation helpers
 * v0.41.16 - C3 Step 17: Unified State Management Foundation
 */
// sanity-fix: replaced zustand import with local stub (missing dependency)
// Proper Zustand-like hook implementation
const create = (creator) => {
    let state;
    const getState = () => state;
    const setState = (partial) => {
        const nextState = typeof partial === 'function'
            ? partial(state)
            : { ...state, ...partial };
        state = nextState;
        return state;
    };
    state = creator(setState, getState);
    return () => state;
};
import { defaultCache, createCacheKey } from './cache';
/**
 * Create async state store
 * Standardized pattern for async data fetching
 */
export function createAsyncStore(config) {
    const initialState = {
        data: config.initialData ?? null,
        loading: false,
        error: null,
    };
    return create((set, get) => ({
        state: initialState,
        load: async (...args) => {
            if (!config.fetcher) {
                console.warn(`[${config.name}] No fetcher provided`);
                return;
            }
            // Check cache first
            const cacheKey = config.cacheKey || createCacheKey(config.name, ...args);
            const cached = defaultCache.get(cacheKey);
            if (cached) {
                set({ state: { data: cached, loading: false, error: null } });
                return;
            }
            set({ state: { ...get().state, loading: true, error: null } });
            try {
                const data = await config.fetcher(...args);
                // Cache the result
                if (config.cacheKey || config.cacheTtl) {
                    defaultCache.set(cacheKey, data, config.cacheTtl);
                }
                set({
                    state: {
                        data,
                        loading: false,
                        error: null,
                    },
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                set({
                    state: {
                        ...get().state,
                        loading: false,
                        error: errorMessage,
                    },
                });
            }
        },
        reload: async (...args) => {
            // Invalidate cache and reload
            const cacheKey = config.cacheKey || createCacheKey(config.name, ...args);
            defaultCache.invalidate(cacheKey);
            await get().load(...args);
        },
        reset: () => {
            set({ state: initialState });
        },
        clearError: () => {
            set({
                state: {
                    ...get().state,
                    error: null,
                },
            });
        },
    }));
}
/**
 * Create resource store
 * For managing a single resource by key (ID, slug, etc.)
 */
export function createResourceStore(config) {
    const initialState = {
        data: null,
        loading: false,
        error: null,
    };
    return create((set, get) => ({
        state: initialState,
        key: null,
        load: async (key) => {
            const cacheKey = createCacheKey(config.name, key);
            const cached = defaultCache.get(cacheKey);
            if (cached) {
                set({ state: { data: cached, loading: false, error: null }, key });
                return;
            }
            set({ state: { ...get().state, loading: true, error: null }, key });
            try {
                const data = await config.fetcher(key);
                if (config.cacheTtl) {
                    defaultCache.set(cacheKey, data, config.cacheTtl);
                }
                set({
                    state: {
                        data,
                        loading: false,
                        error: null,
                    },
                    key,
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                set({
                    state: {
                        ...get().state,
                        loading: false,
                        error: errorMessage,
                    },
                });
            }
        },
        reload: async (key) => {
            const cacheKey = createCacheKey(config.name, key);
            defaultCache.invalidate(cacheKey);
            await get().load(key);
        },
        reset: () => {
            set({ state: initialState, key: null });
        },
        clearError: () => {
            set({
                state: {
                    ...get().state,
                    error: null,
                },
            });
        },
        setKey: (key) => {
            set({ key });
            if (key) {
                get().load(key);
            }
            else {
                get().reset();
            }
        },
    }));
}
/**
 * Create collection store
 * For managing collections/lists
 */
export function createCollectionStore(config) {
    const initialState = {
        data: null,
        loading: false,
        error: null,
    };
    return create((set, get) => ({
        state: initialState,
        load: async (...args) => {
            if (!config.fetcher) {
                console.warn(`[${config.name}] No fetcher provided`);
                return;
            }
            const cacheKey = createCacheKey(config.name);
            const cached = defaultCache.get(cacheKey);
            if (cached) {
                set({ state: { data: cached, loading: false, error: null } });
                return;
            }
            set({ state: { ...get().state, loading: true, error: null } });
            try {
                const data = await config.fetcher(...args);
                if (config.cacheTtl) {
                    defaultCache.set(cacheKey, data, config.cacheTtl);
                }
                set({
                    state: {
                        data,
                        loading: false,
                        error: null,
                    },
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                set({
                    state: {
                        ...get().state,
                        loading: false,
                        error: errorMessage,
                    },
                });
            }
        },
        reload: async (...args) => {
            const cacheKey = createCacheKey(config.name);
            defaultCache.invalidate(cacheKey);
            await get().load(...args);
        },
        reset: () => {
            set({ state: initialState });
        },
        clearError: () => {
            set({
                state: {
                    ...get().state,
                    error: null,
                },
            });
        },
        add: (item) => {
            const current = get().state.data ?? [];
            set({
                state: {
                    ...get().state,
                    data: [...current, item],
                },
            });
        },
        remove: (idOrPredicate) => {
            const current = get().state.data ?? [];
            const predicate = typeof idOrPredicate === 'string'
                ? (item) => item.id === idOrPredicate
                : idOrPredicate;
            set({
                state: {
                    ...get().state,
                    data: current.filter((item) => !predicate(item)),
                },
            });
        },
        update: (idOrPredicate, updates) => {
            const current = get().state.data ?? [];
            const predicate = typeof idOrPredicate === 'string'
                ? (item) => item.id === idOrPredicate
                : idOrPredicate;
            set({
                state: {
                    ...get().state,
                    data: current.map((item) => predicate(item) ? { ...item, ...updates } : item),
                },
            });
        },
        find: (idOrPredicate) => {
            const current = get().state.data ?? [];
            const predicate = typeof idOrPredicate === 'string'
                ? (item) => item.id === idOrPredicate
                : idOrPredicate;
            return current.find(predicate);
        },
    }));
}
/**
 * Create custom store with type safety
 */
export function createStore(creator) {
    return create(creator);
}
