/**
 * State Management Types
 * Core type definitions for unified state management
 * v0.41.16 - C3 Step 17: Unified State Management Foundation
 */

/**
 * Standardized async state pattern
 * Used across all async data fetching stores
 */
export interface AsyncState<T = any> {
  /** The data payload (null when not loaded or on error) */
  data: T | null;
  /** Loading indicator */
  loading: boolean;
  /** Error message (null when no error) */
  error: string | null;
}

/**
 * Extended async state with metadata
 */
export interface AsyncStateWithMeta<T = any, M = any> extends AsyncState<T> {
  /** Optional metadata (timestamps, pagination, etc.) */
  meta?: M;
}

/**
 * Store state shape (base interface)
 * All stores should extend this or use compatible shape
 */
export interface StoreState {
  [key: string]: any;
}

/**
 * Cache entry structure
 */
export interface CacheEntry<T = any> {
  /** Cached data */
  data: T;
  /** Timestamp when cached (milliseconds since epoch) */
  timestamp: number;
  /** Time to live in milliseconds (optional, infinite if not set) */
  ttl?: number;
  /** Optional tags for invalidation */
  tags?: string[];
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Default TTL in milliseconds */
  defaultTtl?: number;
  /** Maximum cache size (number of entries) */
  maxSize?: number;
  /** Whether to enable cache */
  enabled?: boolean;
}

/**
 * State event types
 */
export type StateEventType =
  | 'load'        // Started loading
  | 'success'     // Loaded successfully
  | 'error'       // Error occurred
  | 'update'      // State updated
  | 'invalidate'; // Cache invalidated

/**
 * State event payload
 */
export interface StateEvent {
  /** Event type */
  type: StateEventType;
  /** Store name or identifier */
  store: string;
  /** Event timestamp */
  timestamp: number;
  /** Optional event payload */
  payload?: any;
}

/**
 * Store creator function type
 */
export type StoreCreator<T extends StoreState> = (
  set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
  get: () => T
) => T;

/**
 * Selector function type
 */
export type Selector<TState, TResult> = (state: TState) => TResult;

/**
 * Async action options
 */
export interface AsyncActionOptions {
  /** Whether to show loading state */
  showLoading?: boolean;
  /** Whether to clear error before action */
  clearError?: boolean;
  /** Custom error handler */
  onError?: (error: Error) => void;
  /** Success callback */
  onSuccess?: (data: any) => void;
}

