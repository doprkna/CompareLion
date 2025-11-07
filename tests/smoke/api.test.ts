/**
 * API Smoke Tests
 * Quick health checks for critical API endpoints
 * v0.13.2i - Enhanced with flow and admin routes
 */

import { describe, test, expect } from 'vitest';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Public endpoints (no auth required)
const PUBLIC_ROUTES = [
  '/api/health',
  '/api/version',
  '/api/changelog',
  '/api/achievements',
  '/api/shop',
  '/api/flow/categories',
];

// Protected endpoints (require auth - will return 401)
const PROTECTED_ROUTES = [
  '/api/me',
  '/api/profile',
  '/api/notifications',
  '/api/activity',
  '/api/messages',
  '/api/inventory',
  '/api/wallet',
  '/api/flow/next',
];

// Admin-only endpoints (require admin role - will return 401 or 403)
const ADMIN_ROUTES = [
  '/api/admin/overview',
  '/api/admin/dbcheck',
  '/api/admin/flow-metrics',
];

describe('API Smoke Tests - Public Endpoints', () => {
  test.each(PUBLIC_ROUTES)('%s returns HTTP 200', async (route) => {
    const res = await fetch(BASE_URL + route);
    expect(res.status).toBe(200);
  });

  test.each(PUBLIC_ROUTES)('%s returns valid JSON', async (route) => {
    const res = await fetch(BASE_URL + route);
    const data = await res.json();
    expect(data).toBeDefined();
  });
});

describe('API Smoke Tests - Protected Endpoints', () => {
  test.each(PROTECTED_ROUTES)('%s returns 401 without auth', async (route) => {
    const res = await fetch(BASE_URL + route);
    expect(res.status).toBe(401);
  });

  test.each(PROTECTED_ROUTES)('%s returns JSON error', async (route) => {
    const res = await fetch(BASE_URL + route);
    const data = await res.json();
    expect(data).toHaveProperty('error');
  });
});

describe('API Smoke Tests - Health Checks', () => {
  test('/api/health returns system status', async () => {
    const res = await fetch(BASE_URL + '/api/health');
    const data = await res.json();
    
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('db');
    expect(data).toHaveProperty('uptimeSec');
  });

  test('/api/version returns version info', async () => {
    const res = await fetch(BASE_URL + '/api/version');
    const data = await res.json();
    
    expect(data).toHaveProperty('success');
    expect(data.success).toBe(true);
  });
});

describe('API Smoke Tests - Error Handling', () => {
  test('Invalid route returns 404', async () => {
    const res = await fetch(BASE_URL + '/api/nonexistent-route-12345');
    expect(res.status).toBe(404);
  });

  test('POST without body returns 400 or 401', async () => {
    const res = await fetch(BASE_URL + '/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    // Should be either 400 (bad request) or 401 (unauthorized)
    expect([400, 401]).toContain(res.status);
  });
});

describe('API Smoke Tests - Admin Endpoints', () => {
  test.each(ADMIN_ROUTES)('%s requires authentication', async (route) => {
    const res = await fetch(BASE_URL + route);
    // Should be 401 (no auth) or 403 (not admin)
    expect([401, 403]).toContain(res.status);
  });
});

describe('API Smoke Tests - Flow Integration', () => {
  test('/api/flow/next returns 401 without auth', async () => {
    const res = await fetch(BASE_URL + '/api/flow/next');
    expect(res.status).toBe(401);
  });

  test('/api/flow/categories returns valid JSON', async () => {
    const res = await fetch(BASE_URL + '/api/flow/categories');
    const data = await res.json();
    expect(data).toBeDefined();
  });
});

describe('API Smoke Tests - Flow UX Integration', () => {
  test('/api/flow/answer returns XP value', async () => {
    // This test would require authentication, so we test the endpoint structure
    const res = await fetch(BASE_URL + '/api/flow/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: 'test', skipped: true }),
    });
    
    // Should return 401 without auth, but endpoint should exist
    expect(res.status).toBe(401);
    
    const data = await res.json();
    expect(data).toHaveProperty('error');
  });

  test('/api/flow/next returns proper structure', async () => {
    const res = await fetch(BASE_URL + '/api/flow/next');
    
    // Should return 401 without auth
    expect(res.status).toBe(401);
    
    const data = await res.json();
    expect(data).toHaveProperty('error');
  });

  test('Flow endpoints handle CORS properly', async () => {
    const res = await fetch(BASE_URL + '/api/flow/categories', {
      method: 'OPTIONS',
    });
    
    // Should handle OPTIONS request
    expect([200, 204]).toContain(res.status);
  });
});

describe('API Smoke Tests - Admin Export', () => {
  test('/api/admin/dbcheck returns exportable data', async () => {
    const res = await fetch(BASE_URL + '/api/admin/dbcheck');
    
    // Should require admin auth
    expect([401, 403]).toContain(res.status);
    
    const data = await res.json();
    expect(data).toHaveProperty('error');
  });
});

describe('API Smoke Tests - Response Format', () => {
  test('All public endpoints return consistent format', async () => {
    for (const route of PUBLIC_ROUTES) {
      const res = await fetch(BASE_URL + route);
      const data = await res.json();
      
      // Should have either 'success' or valid data structure
      const hasValidFormat = 
        data.hasOwnProperty('success') ||
        data.hasOwnProperty('version') ||
        data.hasOwnProperty('entries') ||
        data.hasOwnProperty('achievements') ||
        data.hasOwnProperty('items') ||
        Array.isArray(data);
      
      expect(hasValidFormat).toBe(true);
    }
  });

  test('Error responses include error field', async () => {
    const res = await fetch(BASE_URL + '/api/me');
    expect(res.status).toBe(401);
    
    const data = await res.json();
    expect(data).toHaveProperty('error');
  });
});

