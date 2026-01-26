/**
 * Root Store Interface
 * Base store structure and interfaces
 * v0.41.16 - C3 Step 17: Unified State Management Foundation
 */

import type { AsyncState, StoreState } from './types';

/**
 * Base store interface
 * All stores should implement or extend this pattern
 */
export interface BaseStore extends StoreState {
  // Base store can be extended by specific stores
  // This provides a common interface for type checking
}

/**
 * Async store interface
 * Standard pattern for stores that fetch async data
 */
export interface AsyncStore<T = any> extends BaseStore {
  /** Async state */
  state: AsyncState<T>;
  /** Load data */
  load: (...args: any[]) => Promise<void>;
  /** Reload data */
  reload: (...args: any[]) => Promise<void>;
  /** Reset state */
  reset: () => void;
  /** Clear error */
  clearError: () => void;
}

/**
 * Resource store interface
 * For stores that manage a single resource by key
 */
export interface ResourceStore<T = any> extends AsyncStore<T> {
  /** Resource key (ID, slug, etc.) */
  key: string | null;
  /** Set resource key */
  setKey: (key: string | null) => void;
}

/**
 * Collection store interface
 * For stores that manage collections/lists
 */
export interface CollectionStore<T = any> extends AsyncStore<T[]> {
  /** Add item to collection */
  add: (item: T) => void;
  /** Remove item from collection */
  remove: (id: string | ((item: T) => boolean)) => void;
  /** Update item in collection */
  update: (id: string | ((item: T) => boolean), updates: Partial<T>) => void;
  /** Find item in collection */
  find: (id: string | ((item: T) => boolean)) => T | undefined;
}

/**
 * Store metadata
 */
export interface StoreMetadata {
  /** Store name/identifier */
  name: string;
  /** Store version */
  version?: string;
  /** Store creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
}

