/**
 * Error Handling Utility Layer
 * 
 * Provides centralized error handling with:
 * - Custom AppError class for structured errors
 * - logError function for consistent error logging
 * - safe() wrapper for error-safe execution
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Log errors with context
 * - In development: Always logs to console
 * - In production: Only logs if NEXT_PUBLIC_VERBOSE_ERRORS=true
 * - Placeholder for Sentry integration
 */
export function logError(err: unknown, context: string) {
  const isProd = process.env.NODE_ENV === "production";
  const payload = { 
    error: err instanceof Error ? err.message : String(err), 
    context,
    stack: err instanceof Error ? err.stack : undefined
  };

  if (!isProd || process.env.NEXT_PUBLIC_VERBOSE_ERRORS === "true") {
    console.error(`[${context}]`, payload);
  }

  // Optional Sentry or telemetry integration
  if (isProd) {
    // Placeholder for Sentry / telemetry
    // Example: Sentry.captureException(err, { tags: { context } });
    // console.log("Send to Sentry:", payload);
  }
}

/**
 * Safe execution wrapper
 * Executes a function and returns null on error instead of throwing
 * 
 * @example
 * const result = safe(() => JSON.parse(data));
 * if (!result) { // handle error }
 */
export function safe<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch (e) {
    logError(e, "safe()");
    return null;
  }
}

/**
 * Async safe execution wrapper
 * Similar to safe() but for async functions
 */
export async function safeAsync<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (e) {
    logError(e, "safeAsync()");
    return null;
  }
}

