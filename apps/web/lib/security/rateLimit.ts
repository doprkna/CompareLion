import { Redis } from '@upstash/redis';
import { LRUCache } from 'lru-cache';
import { logger } from '@/lib/logger';

// Redis client (will be null if not configured)
let _redis: Redis | null = null;

// LRU cache fallback
const lruCache = new LRUCache<string, { count: number; resetTime: number }>({
  max: 10000, // Maximum number of entries
  ttl: 1000 * 60 * 60, // 1 hour TTL
});

function getRedis(): Redis | null {
  if (!_redis) {
    try {
      const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
      const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
      
      if (redisUrl && redisToken) {
        _redis = new Redis({
          url: redisUrl,
          token: redisToken,
        });
      }
    } catch (error) {
      logger.warn('Failed to initialize Redis client', error);
      _redis = null;
    }
  }
  return _redis;
}

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Default key generator (IP-based)
function defaultKeyGenerator(req: Request): string {
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
  return `rate_limit:${ip}`;
}

// Email+IP key generator for login attempts
function emailIpKeyGenerator(req: Request, email: string): string {
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
  return `login_attempts:${email}:${ip}`;
}

// Check rate limit using Redis or LRU cache
async function checkRateLimit(
  key: string, 
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  const resetTime = now + config.windowMs;

  const redis = getRedis();
  if (redis) {
    // Use Redis for distributed rate limiting
    try {
      const pipeline = redis.pipeline();
      
      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Count current requests
      pipeline.zcard(key);
      
      // Add current request
      pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });
      
      // Set expiry
      pipeline.expire(key, Math.ceil(config.windowMs / 1000));
      
      const results = await pipeline.exec();
      const currentCount = results[1] as number;
      
      const allowed = currentCount < config.maxRequests;
      const remaining = Math.max(0, config.maxRequests - currentCount - 1);
      
      return {
        allowed,
        remaining,
        resetTime,
        retryAfter: allowed ? undefined : Math.ceil((resetTime - now) / 1000)
      };
    } catch (error) {
      logger.error('Redis rate limit error', error);
      // Fallback to LRU cache
    }
  }

  // Use LRU cache fallback
  const entry = lruCache.get(key);
  const currentCount = entry ? entry.count : 0;
  
  if (entry && entry.resetTime > now) {
    // Within current window
    const allowed = currentCount < config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - currentCount - 1);
    
    // Update count
    lruCache.set(key, { count: currentCount + 1, resetTime: entry.resetTime });
    
    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
      retryAfter: allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000)
    };
  } else {
    // New window or expired
    const allowed = true;
    const remaining = config.maxRequests - 1;
    
    lruCache.set(key, { count: 1, resetTime });
    
    return {
      allowed,
      remaining,
      resetTime,
      retryAfter: undefined
    };
  }
}

// Rate limiting for login attempts
export async function checkLoginRateLimit(req: Request): Promise<RateLimitResult> {
  const key = defaultKeyGenerator(req);
  
  // 5 requests per minute
  return checkRateLimit(key, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5
  });
}

// Rate limiting for signup attempts
export async function checkSignupRateLimit(req: Request): Promise<RateLimitResult> {
  const key = defaultKeyGenerator(req);
  
  // 3 requests per hour
  return checkRateLimit(key, {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3
  });
}

// Daily rate limiting for login attempts
export async function checkDailyLoginRateLimit(req: Request): Promise<RateLimitResult> {
  const key = `${defaultKeyGenerator(req)}:daily`;
  
  // 50 requests per day
  return checkRateLimit(key, {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 50
  });
}

// Failed login attempt tracking
export async function trackFailedLogin(req: Request, email: string): Promise<{
  attempts: number;
  locked: boolean;
  lockoutUntil?: number;
}> {
  const key = emailIpKeyGenerator(req, email);
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const lockoutDuration = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10;

  const redis = getRedis();
  if (redis) {
    try {
      const pipeline = redis.pipeline();
      
      // Get current attempts
      pipeline.get(`${key}:attempts`);
      pipeline.get(`${key}:lockout`);
      
      const results = await pipeline.exec();
      const attempts = parseInt(results[0] as string || '0');
      const lockoutUntil = parseInt(results[1] as string || '0');
      
      // Check if currently locked out
      if (lockoutUntil > now) {
        return {
          attempts,
          locked: true,
          lockoutUntil
        };
      }
      
      // Increment attempts
      const newAttempts = attempts + 1;
      pipeline.set(`${key}:attempts`, newAttempts.toString(), { ex: Math.ceil(oneHour / 1000) });
      
      if (newAttempts >= maxAttempts) {
        // Lock out for 15 minutes
        const newLockoutUntil = now + lockoutDuration;
        pipeline.set(`${key}:lockout`, newLockoutUntil.toString(), { ex: Math.ceil(lockoutDuration / 1000) });
        
        await pipeline.exec();
        
        return {
          attempts: newAttempts,
          locked: true,
          lockoutUntil: newLockoutUntil
        };
      }
      
      await pipeline.exec();
      
      return {
        attempts: newAttempts,
        locked: false
      };
    } catch (error) {
      logger.error('Redis failed login tracking error', error);
      // Fallback to LRU cache
    }
  }

  // LRU cache fallback
  const attemptsKey = `${key}:attempts`;
  const lockoutKey = `${key}:lockout`;
  
  const attemptsEntry = lruCache.get(attemptsKey);
  const lockoutEntry = lruCache.get(lockoutKey);
  
  const currentAttempts = attemptsEntry ? attemptsEntry.count : 0;
  const lockoutUntil = lockoutEntry ? lockoutEntry.resetTime : 0;
  
  // Check if currently locked out
  if (lockoutUntil > now) {
    return {
      attempts: currentAttempts,
      locked: true,
      lockoutUntil
    };
  }
  
  // Increment attempts
  const newAttempts = currentAttempts + 1;
  lruCache.set(attemptsKey, { count: newAttempts, resetTime: now + oneHour });
  
  if (newAttempts >= maxAttempts) {
    // Lock out for 15 minutes
    const newLockoutUntil = now + lockoutDuration;
    lruCache.set(lockoutKey, { count: 1, resetTime: newLockoutUntil });
    
    return {
      attempts: newAttempts,
      locked: true,
      lockoutUntil: newLockoutUntil
    };
  }
  
  return {
    attempts: newAttempts,
    locked: false
  };
}

// Clear failed login attempts (call on successful login)
export async function clearFailedLogins(req: Request, email: string): Promise<void> {
  const key = emailIpKeyGenerator(req, email);
  
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(`${key}:attempts`, `${key}:lockout`);
    } catch (error) {
      logger.error('Redis clear failed logins error', error);
    }
  } else {
    // LRU cache fallback
    lruCache.delete(`${key}:attempts`);
    lruCache.delete(`${key}:lockout`);
  }
}
