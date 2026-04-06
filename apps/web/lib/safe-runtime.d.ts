/**
 * Safe Runtime Guard
 *
 * Prevents server-side code from executing during static analysis/scanning.
 * Returns safe noop objects when running in scan mode.
 */
/**
 * Safe runtime wrapper for server-side initialization
 * Returns a safe noop object during scan mode, otherwise executes the factory
 */
export declare function safeRuntime<T>(factory: () => T): T | {};
/**
 * Safe lazy runtime wrapper
 * Returns a proxy that lazily initializes only when accessed at runtime
 */
export declare function safeLazyRuntime<T>(factory: () => T): T;
