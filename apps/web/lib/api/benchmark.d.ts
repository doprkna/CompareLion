/**
 * Wrap async function with timing measurement
 * Logs to console and file (append mode)
 *
 * @param label - Label for the performance measurement
 * @param fn - Async function to measure
 * @returns Result of the async function
 */
export declare function withTiming<T>(label: string, fn: () => Promise<T>): Promise<T>;
/**
 * Sync timing wrapper (for synchronous functions)
 */
export declare function withTimingSync<T>(label: string, fn: () => T): T;
