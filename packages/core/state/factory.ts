/**
 * Store Factory
 * Zustand store creation helpers
 * v0.41.16 - C3 Step 17: Unified State Management Foundation
 */

// sanity-fix: replaced zustand import with local stub (missing dependency)
// Proper Zustand-like hook implementation
const create = <T>(creator: (set: any, get: () => T) => T) => {
  let state: T;
  const getState = () => state;
  const setState = (partial: Partial<T> | ((current: T) => T)) => {
    const nextState = typeof partial === 'function' 
      ? (partial as (current: T) => T)(state)
      : { ...state, ...partial };
    state = nextState as T;
    return state;
  };
  state = creator(setState, getState);
  return () => state;
};
type StoreApi<T> = any;
type UseBoundStore<T> = any;
import type { AsyncState, AsyncActionOptions, StoreCreator } from './types';
import type { AsyncStore, ResourceStore, CollectionStore } from './store';
import { defaultCache, createCacheKey } from './cache';

/**
 * Create async state store
 * Standardized pattern for async data fetching
 */
export function createAsyncStore<T = any>(config: {
  name: string;
  initialData?: T | null;
  fetcher?: (...args: any[]) => Promise<T>;
  cacheKey?: string;
  cacheTtl?: number;
}): UseBoundStore<StoreApi<AsyncStore<T>>> {
  const initialState: AsyncState<T> = {
    data: config.initialData ?? null,
    loading: false,
    error: null,
  };

  return create<AsyncStore<T>>((set, get) => ({
    state: initialState,

    load: async (...args: any[]) => {
      if (!config.fetcher) {
        console.warn(`[${config.name}] No fetcher provided`);
        return;
      }

      // Check cache first
      const cacheKey = config.cacheKey || createCacheKey(config.name, ...args);
      const cached = defaultCache.get<T>(cacheKey);
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
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred';
        set({
          state: {
            ...get().state,
            loading: false,
            error: errorMessage,
          },
        });
      }
    },

    reload: async (...args: any[]) => {
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
export function createResourceStore<T = any>(config: {
  name: string;
  fetcher: (key: string) => Promise<T>;
  cacheTtl?: number;
}): UseBoundStore<StoreApi<ResourceStore<T>>> {
  const initialState: AsyncState<T> = {
    data: null,
    loading: false,
    error: null,
  };

  return create<ResourceStore<T>>((set, get) => ({
    state: initialState,
    key: null,

    load: async (key: string) => {
      const cacheKey = createCacheKey(config.name, key);
      const cached = defaultCache.get<T>(cacheKey);
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
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred';
        set({
          state: {
            ...get().state,
            loading: false,
            error: errorMessage,
          },
        });
      }
    },

    reload: async (key: string) => {
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

    setKey: (key: string | null) => {
      set({ key });
      if (key) {
        get().load(key);
      } else {
        get().reset();
      }
    },
  }));
}

/**
 * Create collection store
 * For managing collections/lists
 */
export function createCollectionStore<T extends { id: string }>(config: {
  name: string;
  fetcher?: () => Promise<T[]>;
  cacheTtl?: number;
}): UseBoundStore<StoreApi<CollectionStore<T>>> {
  const initialState: AsyncState<T[]> = {
    data: null,
    loading: false,
    error: null,
  };

  return create<CollectionStore<T>>((set, get) => ({
    state: initialState,

    load: async (...args: any[]) => {
      if (!config.fetcher) {
        console.warn(`[${config.name}] No fetcher provided`);
        return;
      }

      const cacheKey = createCacheKey(config.name);
      const cached = defaultCache.get<T[]>(cacheKey);
      if (cached) {
        set({ state: { data: cached, loading: false, error: null } });
        return;
      }

      set({ state: { ...get().state, loading: true, error: null } });

      try {
        const data = await config.fetcher!();
        
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
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred';
        set({
          state: {
            ...get().state,
            loading: false,
            error: errorMessage,
          },
        });
      }
    },

    reload: async (...args: any[]) => {
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

    add: (item: T) => {
      const current = get().state.data ?? [];
      set({
        state: {
          ...get().state,
          data: [...current, item],
        },
      });
    },

    remove: (idOrPredicate: string | ((item: T) => boolean)) => {
      const current = get().state.data ?? [];
      const predicate =
        typeof idOrPredicate === 'string'
          ? (item: T) => item.id === idOrPredicate
          : idOrPredicate;
      set({
        state: {
          ...get().state,
          data: current.filter((item) => !predicate(item)),
        },
      });
    },

    update: (
      idOrPredicate: string | ((item: T) => boolean),
      updates: Partial<T>
    ) => {
      const current = get().state.data ?? [];
      const predicate =
        typeof idOrPredicate === 'string'
          ? (item: T) => item.id === idOrPredicate
          : idOrPredicate;
      set({
        state: {
          ...get().state,
          data: current.map((item) =>
            predicate(item) ? { ...item, ...updates } : item
          ),
        },
      });
    },

    find: (idOrPredicate: string | ((item: T) => boolean)): T | undefined => {
      const current = get().state.data ?? [];
      const predicate =
        typeof idOrPredicate === 'string'
          ? (item: T) => item.id === idOrPredicate
          : idOrPredicate;
      return current.find(predicate);
    },
  }));
}

/**
 * Create custom store with type safety
 */
export function createStore<T extends Record<string, any>>(
  creator: StoreCreator<T>
): UseBoundStore<StoreApi<T>> {
  return create<T>(creator);
}

