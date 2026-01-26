/**
 * Store Factory
 * Zustand store creation helpers
 * v0.41.16 - C3 Step 17: Unified State Management Foundation
 */
// sanity-fix: replaced zustand type imports with local type stubs (missing dependency)
type StoreApi<T> = any;
type UseBoundStore<T> = any;
import type { StoreCreator } from './types';
import type { AsyncStore, ResourceStore, CollectionStore } from './store';
/**
 * Create async state store
 * Standardized pattern for async data fetching
 */
export declare function createAsyncStore<T = any>(config: {
    name: string;
    initialData?: T | null;
    fetcher?: (...args: any[]) => Promise<T>;
    cacheKey?: string;
    cacheTtl?: number;
}): UseBoundStore<StoreApi<AsyncStore<T>>>;
/**
 * Create resource store
 * For managing a single resource by key (ID, slug, etc.)
 */
export declare function createResourceStore<T = any>(config: {
    name: string;
    fetcher: (key: string) => Promise<T>;
    cacheTtl?: number;
}): UseBoundStore<StoreApi<ResourceStore<T>>>;
/**
 * Create collection store
 * For managing collections/lists
 */
export declare function createCollectionStore<T extends {
    id: string;
}>(config: {
    name: string;
    fetcher?: () => Promise<T[]>;
    cacheTtl?: number;
}): UseBoundStore<StoreApi<CollectionStore<T>>>;
/**
 * Create custom store with type safety
 */
export declare function createStore<T extends Record<string, any>>(creator: StoreCreator<T>): UseBoundStore<StoreApi<T>>;
