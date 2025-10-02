import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  checkLoginRateLimit,
  checkDailyLoginRateLimit,
  checkSignupRateLimit,
  trackFailedLogin,
  clearFailedLogins,
  getIpAddress,
} from '@/lib/security/rateLimit';

// Mock Redis
const mockRedis = {
  incr: vi.fn(),
  expire: vi.fn(),
  get: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
  multi: vi.fn().mockReturnThis(),
  exec: vi.fn(),
};

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => mockRedis),
}));

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn().mockImplementation(() => ({
    limit: vi.fn(),
  })),
}));

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env.UPSTASH_REDIS_REST_URL = '';
    process.env.UPSTASH_REDIS_REST_TOKEN = '';
  });

  describe('getIpAddress', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        headers: {
          'x-forwarded-for': '192.168.1.100, 10.0.0.1',
        },
      });

      const ip = getIpAddress(req);
      expect(ip).toBe('192.168.1.100');
    });

    it('should extract IP from x-real-ip header', () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        headers: {
          'x-real-ip': '203.0.113.1',
        },
      });

      const ip = getIpAddress(req);
      expect(ip).toBe('203.0.113.1');
    });

    it('should return unknown for missing IP headers', () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login');

      const ip = getIpAddress(req);
      expect(ip).toBe('unknown');
    });
  });

  describe('checkLoginRateLimit', () => {
    it('should allow requests within rate limit', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login');
      
      const result = await checkLoginRateLimit(req);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should use LRU cache when Redis is not configured', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login');
      
      // Should not throw error even without Redis
      const result = await checkLoginRateLimit(req);
      
      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('resetTime');
    });
  });

  describe('checkDailyLoginRateLimit', () => {
    it('should allow requests within daily limit', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login');
      
      const result = await checkDailyLoginRateLimit(req);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });
  });

  describe('checkSignupRateLimit', () => {
    it('should allow requests within hourly limit', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/signup');
      
      const result = await checkSignupRateLimit(req);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });
  });

  describe('trackFailedLogin', () => {
    it('should track failed login attempts', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        headers: {
          'x-forwarded-for': '192.168.1.100',
        },
      });

      const result = await trackFailedLogin(req, 'test@example.com');
      
      expect(result).toHaveProperty('attempts');
      expect(result).toHaveProperty('locked');
      expect(result.attempts).toBeGreaterThan(0);
      expect(result.locked).toBe(false);
    });

    it('should lock account after max attempts', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        headers: {
          'x-forwarded-for': '192.168.1.100',
        },
      });

      // Simulate multiple failed attempts
      for (let i = 0; i < 12; i++) {
        await trackFailedLogin(req, 'test@example.com');
      }

      const result = await trackFailedLogin(req, 'test@example.com');
      
      expect(result.locked).toBe(true);
      expect(result.attempts).toBeGreaterThan(10);
    });

    it('should use LRU cache when Redis is not configured', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login');
      
      const result = await trackFailedLogin(req, 'test@example.com');
      
      expect(result).toHaveProperty('attempts');
      expect(result).toHaveProperty('locked');
    });
  });

  describe('clearFailedLogins', () => {
    it('should clear failed login attempts', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        headers: {
          'x-forwarded-for': '192.168.1.100',
        },
      });

      // Should not throw error
      await expect(clearFailedLogins(req, 'test@example.com')).resolves.not.toThrow();
    });
  });

  describe('Redis Integration', () => {
    beforeEach(() => {
      // Mock Redis environment variables
      process.env.UPSTASH_REDIS_REST_URL = 'https://test-redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    });

    it('should use Redis when configured', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const mockLimit = vi.fn().mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() + 60000,
      });

      (Ratelimit as any).mockImplementation(() => ({
        limit: mockLimit,
      }));

      const req = new NextRequest('http://localhost:3000/api/auth/login');
      
      const result = await checkLoginRateLimit(req);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should handle Redis rate limit exceeded', async () => {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const mockLimit = vi.fn().mockResolvedValue({
        success: false,
        limit: 5,
        remaining: 0,
        reset: Date.now() + 60000,
      });

      (Ratelimit as any).mockImplementation(() => ({
        limit: mockLimit,
      }));

      const req = new NextRequest('http://localhost:3000/api/auth/login');
      
      const result = await checkLoginRateLimit(req);
      
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });
  });

  describe('Failed Login Tracking with Redis', () => {
    beforeEach(() => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://test-redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    });

    it('should increment failed login counter', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);
      mockRedis.get.mockResolvedValue(null);
      mockRedis.multi.mockReturnThis();
      mockRedis.exec.mockResolvedValue([1, 1, null]);

      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        headers: {
          'x-forwarded-for': '192.168.1.100',
        },
      });

      const result = await trackFailedLogin(req, 'test@example.com');
      
      expect(result.attempts).toBe(1);
      expect(result.locked).toBe(false);
    });

    it('should apply lockout after max attempts', async () => {
      mockRedis.incr.mockResolvedValue(11);
      mockRedis.expire.mockResolvedValue(1);
      mockRedis.get.mockResolvedValue(null);
      mockRedis.setex.mockResolvedValue('OK');
      mockRedis.multi.mockReturnThis();
      mockRedis.exec.mockResolvedValue([11, 1, null]);

      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        headers: {
          'x-forwarded-for': '192.168.1.100',
        },
      });

      const result = await trackFailedLogin(req, 'test@example.com');
      
      expect(result.attempts).toBe(11);
      expect(result.locked).toBe(true);
      expect(result.lockoutUntil).toBeGreaterThan(Date.now());
    });

    it('should clear failed login attempts', async () => {
      mockRedis.del.mockResolvedValue(1);

      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        headers: {
          'x-forwarded-for': '192.168.1.100',
        },
      });

      await clearFailedLogins(req, 'test@example.com');
      
      expect(mockRedis.del).toHaveBeenCalledWith(
        expect.stringContaining('login_attempts:test@example.com:192.168.1.100')
      );
    });
  });
});
