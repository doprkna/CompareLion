/**
 * Safe Runtime Guard
 * 
 * Prevents server-side code from executing during static analysis/scanning.
 * Returns safe noop objects when running in scan mode.
 */

/**
 * Check if we're in scan/analysis mode
 */
function isScanMode(): boolean {
  // Check if process is undefined (browser/static analysis)
  if (typeof process === "undefined") return true;
  
  // Check for explicit scan mode flag
  if (process.env.BUILD_MODE === "scan") return true;
  
  // Check if we're in a build/analysis context
  if (process.env.NODE_ENV === undefined && typeof window === "undefined") return true;
  
  return false;
}

/**
 * Safe runtime wrapper for server-side initialization
 * Returns a safe noop object during scan mode, otherwise executes the factory
 */
export function safeRuntime<T>(factory: () => T): T | {} {
  if (isScanMode()) {
    return {} as any;
  }
  return factory();
}

/**
 * Safe lazy runtime wrapper
 * Returns a proxy that lazily initializes only when accessed at runtime
 */
export function safeLazyRuntime<T>(factory: () => T): T {
  let instance: T | null = null;
  
  if (isScanMode()) {
    return {} as any;
  }
  
  return new Proxy({} as T, {
    get(_target, prop) {
      if (!instance) {
        instance = factory();
      }
      const value = (instance as any)[prop];
      return typeof value === 'function' ? value.bind(instance) : value;
    },
    set(_target, prop, value) {
      if (!instance) {
        instance = factory();
      }
      (instance as any)[prop] = value;
      return true;
    }
  });
}

