import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Performance benchmarking utility
 * Logs API timing to console and file
 * v0.32.1 - Performance & Caching Audit
 */

const PERF_LOG_PATH = join(process.cwd(), 'logs', 'perf.log');

/**
 * Ensure logs directory exists
 */
async function ensureLogDir(): Promise<void> {
  const logDir = join(process.cwd(), 'logs');
  try {
    await fs.access(logDir);
  } catch {
    await fs.mkdir(logDir, { recursive: true });
  }
}

/**
 * Write performance log entry to file
 */
async function writeLog(label: string, duration: number): Promise<void> {
  try {
    await ensureLogDir();
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${label}: ${duration}ms\n`;
    await fs.appendFile(PERF_LOG_PATH, entry);
  } catch (error) {
    // Silently fail if log write fails (non-critical)
    console.warn('[PERF] Failed to write log:', error);
  }
}

/**
 * Wrap async function with timing measurement
 * Logs to console and file (append mode)
 * 
 * @param label - Label for the performance measurement
 * @param fn - Async function to measure
 * @returns Result of the async function
 */
export async function withTiming<T>(label: string, fn: () => Promise<T>): Promise<T> {
  // Only log in development
  if (process.env.NODE_ENV === 'production') {
    return fn();
  }

  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    
    // Log to console
    console.log(`[PERF] ${label}: ${duration}ms`);
    
    // Log to file
    await writeLog(label, duration);
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[PERF] ${label}: ${duration}ms (ERROR)`);
    await writeLog(`${label} (ERROR)`, duration);
    throw error;
  }
}

/**
 * Sync timing wrapper (for synchronous functions)
 */
export function withTimingSync<T>(label: string, fn: () => T): T {
  if (process.env.NODE_ENV === 'production') {
    return fn();
  }

  const start = Date.now();
  try {
    const result = fn();
    const duration = Date.now() - start;
    console.log(`[PERF] ${label}: ${duration}ms`);
    writeLog(label, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[PERF] ${label}: ${duration}ms (ERROR)`);
    writeLog(`${label} (ERROR)`, duration);
    throw error;
  }
}

