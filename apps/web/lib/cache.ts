/**
 * Simple In-Memory Cache
 * Fallback for flow state when Redis not available
 * v0.13.2i
 */

import { logger } from '@parel/core/utils/debug';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.cache = new Map();
    this.cleanupInterval = null;
    this.startCleanup();
  }

  /**
   * Set a value with optional TTL (in seconds)
   */
  set<T>(key: string, value: T, ttl: number = 3600): void {
    const expiresAt = Date.now() + ttl * 1000;
    this.cache.set(key, { value, expiresAt });
    logger.debug(`Cache SET: ${key}`, { ttl });
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      logger.debug(`Cache EXPIRED: ${key}`);
      return null;
    }

    logger.debug(`Cache HIT: ${key}`);
    return entry.value as T;
  }

  /**
   * Delete a value from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug(`Cache DELETE: ${key}`);
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    logger.debug('Cache CLEARED');
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        logger.debug(`Cache cleanup: removed ${cleaned} expired entries`);
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Stop cleanup interval
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton instance
export const cache = new MemoryCache();

/**
 * Flow-specific cache helpers
 */
export interface FlowState {
  flowId: string;
  lastQuestionId: string;
  startedAt: number;
  questionsAnswered: number;
}

export function setFlowState(userId: string, state: FlowState): void {
  cache.set(`flow:${userId}`, state, 3600); // 1 hour TTL
}

export function getFlowState(userId: string): FlowState | null {
  return cache.get<FlowState>(`flow:${userId}`);
}

export function clearFlowState(userId: string): void {
  cache.delete(`flow:${userId}`);
}
