/**
 * Debug Utility
 * Centralized logging with environment-based control
 * v0.13.2p - Enhanced with PII sanitization and build tagging
 * v0.30.4 - Infrastructure Refactor - Consolidated all debug utilities
 */

// TODO-PHASE2: BUILD_INFO and LOGGING config needs to be moved to @parel/core/config
// For now, using simplified logging without build tags
import { IS_DEV as CORE_IS_DEV } from '../config/env'; // sanity-fix: replaced circular @parel/core/config import with relative path
// TODO-ENV: Consider injecting ENVIRONMENT via config instead of reading process.env directly
const BUILD_INFO = { VERSION: '0.0.0', BUILD_ID: '', ENVIRONMENT: process.env.NODE_ENV || 'development' };
const LOGGING = { SANITIZE_ERRORS: true, INCLUDE_BUILD_ID: false, INCLUDE_ENV_TAG: false };

const IS_DEV = CORE_IS_DEV;
// TODO-ENV: Consider adding IS_TEST to central env config
const IS_TEST = process.env.NODE_ENV === 'test';
const DEBUG_ENABLED = process.env.NEXT_PUBLIC_DEBUG === '1' || IS_DEV;

/**
 * Sanitize PII from objects (emails, phone numbers, tokens)
 */
function sanitizePII(obj: any): any {
  if (!LOGGING.SANITIZE_ERRORS) return obj;
  
  if (typeof obj === 'string') {
    return obj
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]')
      .replace(/Bearer\s+[^\s]+/g, 'Bearer [TOKEN_REDACTED]');
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      if (['email', 'phone', 'password', 'token', 'apiKey'].includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizePII(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Build tag prefix for logs
 */
function getBuildPrefix(): string {
  if (!LOGGING.INCLUDE_BUILD_ID) return '';
  return `[${BUILD_INFO.VERSION}:${BUILD_INFO.BUILD_ID}${LOGGING.INCLUDE_ENV_TAG ? `:${BUILD_INFO.ENVIRONMENT}` : ''}] `;
}

export interface DebugContext {
  [key: string]: any;
}

/**
 * Debug log (only in development or when DEBUG=1)
 */
export function debug(message: string, context?: DebugContext): void {
  if (!DEBUG_ENABLED) return;
  
  if (context) {
    console.log(`[DEBUG] ${message}`, context);
  } else {
    console.log(`[DEBUG] ${message}`);
  }
}

/**
 * Info log (visible in all environments)
 */
export function info(message: string, context?: DebugContext): void {
  if (context) {
    console.info(`[INFO] ${message}`, context);
  } else {
    console.info(`[INFO] ${message}`);
  }
}

/**
 * Warning log
 */
export function warn(message: string, context?: DebugContext): void {
  if (context) {
    console.warn(`[WARN] ${message}`, context);
  } else {
    console.warn(`[WARN] ${message}`);
  }
}

/**
 * Error log (with PII sanitization)
 */
export function error(message: string, err?: Error | unknown, context?: DebugContext): void {
  const prefix = getBuildPrefix();
  const sanitizedContext = sanitizePII(context);
  
  if (err instanceof Error) {
    console.error(`${prefix}[ERROR] ${message}`, { 
      error: err.message, 
      stack: IS_DEV ? err.stack : undefined,
      ...sanitizedContext 
    });
  } else if (context) {
    console.error(`${prefix}[ERROR] ${message}`, { error: err, ...sanitizedContext });
  } else {
    console.error(`${prefix}[ERROR] ${message}`, err);
  }
}

/**
 * Performance timing utility
 */
export function perfStart(label: string): () => void {
  if (!DEBUG_ENABLED) return () => {};
  
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    debug(`⏱️  ${label}`, { durationMs: duration.toFixed(2) });
  };
}

/**
 * Conditional debug based on flag
 */
export function debugIf(condition: boolean, message: string, context?: DebugContext): void {
  if (condition && DEBUG_ENABLED) {
    debug(message, context);
  }
}

/**
 * Test-only logging
 */
export function testLog(message: string, context?: DebugContext): void {
  if (IS_TEST) {
    console.log(`[TEST] ${message}`, context || '');
  }
}

/**
 * API request/response logger
 */
export function logApi(method: string, path: string, status: number, duration?: number): void {
  if (!DEBUG_ENABLED) return;
  
  const statusColor = status >= 200 && status < 300 ? '✅' : '❌';
  const msg = `${statusColor} ${method} ${path} → ${status}`;
  
  if (duration !== undefined) {
    debug(msg, { durationMs: duration.toFixed(2) });
  } else {
    debug(msg);
  }
}

/**
 * Database query logger
 */
export function logQuery(operation: string, table: string, duration?: number): void {
  if (!DEBUG_ENABLED) return;
  
  if (duration !== undefined) {
    debug(`🗄️  ${operation} ${table}`, { durationMs: duration.toFixed(2) });
  } else {
    debug(`🗄️  ${operation} ${table}`);
  }
}

// Re-export for easy migration
export const logger = {
  debug,
  info,
  warn,
  error,
  perfStart,
  debugIf,
  testLog,
  logApi,
  logQuery,
};


