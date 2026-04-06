/**
 * Debug Utility — delegates to @parel/core/logger (#68)
 * Keeps perfStart, debugIf, testLog, logApi, logQuery for backward compatibility.
 * Prefer importing from @parel/core/logger for new code.
 */

import { logger as coreLogger } from '../logger';
import { IS_DEV as CORE_IS_DEV } from '../config/env';

const IS_TEST = process.env.NODE_ENV === 'test';
const DEBUG_ENABLED = process.env.NEXT_PUBLIC_DEBUG === '1' || CORE_IS_DEV;

export interface DebugContext {
  [key: string]: unknown;
}

export const debug = coreLogger.debug.bind(coreLogger);
export const info = coreLogger.info.bind(coreLogger);
export const warn = coreLogger.warn.bind(coreLogger);

export function error(message: string, err?: Error | unknown, context?: DebugContext): void {
  coreLogger.error(message, err, context);
}

export function perfStart(label: string): () => void {
  if (!DEBUG_ENABLED) return () => {};
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    coreLogger.debug(`⏱️  ${label}`, { durationMs: duration.toFixed(2) });
  };
}

export function debugIf(condition: boolean, message: string, context?: DebugContext): void {
  if (condition && DEBUG_ENABLED) {
    coreLogger.debug(message, context);
  }
}

export function testLog(message: string, context?: DebugContext): void {
  if (IS_TEST) {
    coreLogger.debug(`[TEST] ${message}`, context);
  }
}

export function logApi(method: string, path: string, status: number, duration?: number): void {
  if (!DEBUG_ENABLED) return;
  const statusColor = status >= 200 && status < 300 ? '✅' : '❌';
  const msg = `${statusColor} ${method} ${path} → ${status}`;
  coreLogger.debug(msg, duration !== undefined ? { durationMs: duration.toFixed(2) } : undefined);
}

export function logQuery(operation: string, table: string, duration?: number): void {
  if (!DEBUG_ENABLED) return;
  coreLogger.debug(
    `🗄️  ${operation} ${table}`,
    duration !== undefined ? { durationMs: duration.toFixed(2) } : undefined
  );
}

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
  child: coreLogger.child.bind(coreLogger),
};
