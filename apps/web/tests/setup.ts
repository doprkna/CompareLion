import { vi } from 'vitest';
import { beforeAll, afterEach, afterAll } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.APP_MAIL_FROM = 'test@example.com';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.ADMIN_EMAILS = 'admin@test.com';

// Mock Next.js modules
vi.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(public url: string, public init?: RequestInit) {}
    
    get headers() {
      return new Map([
        ['x-forwarded-for', '127.0.0.1'],
        ['user-agent', 'test-agent'],
      ]);
    }
    
    get cookies() {
      return {
        get: vi.fn().mockReturnValue({ value: null }),
        set: vi.fn(),
        delete: vi.fn(),
      };
    }
    
    get nextUrl() {
      return {
        pathname: new URL(this.url).pathname,
        searchParams: new URL(this.url).searchParams,
      };
    }
    
    async json() {
      return {};
    }
  },
  
  NextResponse: {
    json: vi.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      headers: new Map(),
    })),
    next: vi.fn(() => ({
      headers: new Map(),
    })),
  },
}));

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    wallet: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    purchase: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    entitlement: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    ledgerEntry: {
      create: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
    $disconnect: vi.fn(),
  },
}));

// Mock email service
vi.mock('@/lib/email/resend', () => ({
  sendEmail: vi.fn().mockResolvedValue({
    success: true,
    messageId: 'test-message-id',
  }),
}));

// Mock rate limiting
vi.mock('@/lib/security/rateLimit', () => ({
  checkLoginRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 5,
    resetTime: Date.now() + 60000,
  }),
  checkDailyLoginRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 50,
    resetTime: Date.now() + 86400000,
  }),
  checkSignupRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 3,
    resetTime: Date.now() + 3600000,
  }),
  trackFailedLogin: vi.fn().mockResolvedValue({
    attempts: 0,
    locked: false,
  }),
  clearFailedLogins: vi.fn(),
  getIpAddress: vi.fn().mockReturnValue('127.0.0.1'),
}));

// Mock hCaptcha
vi.mock('@/lib/security/hcaptcha', () => ({
  verifyHCaptcha: vi.fn().mockResolvedValue({
    success: true,
  }),
  isHCaptchaRequired: vi.fn().mockReturnValue(false),
}));

// Mock audit service
vi.mock('@/lib/services/auditService', () => ({
  logAuditEvent: vi.fn(),
  extractIpFromRequest: vi.fn().mockReturnValue('127.0.0.1'),
}));

// Mock newsletter providers
vi.mock('@/lib/newsletter/providers', () => ({
  createNewsletterProvider: vi.fn().mockReturnValue({
    subscribe: vi.fn().mockResolvedValue({ success: true }),
    unsubscribe: vi.fn().mockResolvedValue({ success: true }),
  }),
}));

// Mock JWT/session utilities
vi.mock('@/lib/auth/session', () => ({
  createSession: vi.fn().mockResolvedValue('mock-jwt-token'),
  setSessionCookie: vi.fn(),
  verifySession: vi.fn().mockReturnValue({ userId: 'test-user-123', email: 'test@example.com' }),
}));

// Mock wallet transactions
vi.mock('@/lib/utils/walletTransactions', () => ({
  updateWalletWithLock: vi.fn().mockResolvedValue({
    success: true,
    newBalance: { funds: 9000, diamonds: 0 },
  }),
  getWalletBalanceWithLock: vi.fn().mockResolvedValue({
    funds: 10000,
    diamonds: 100,
  }),
  transferBetweenWallets: vi.fn().mockResolvedValue({ success: true }),
  bulkWalletUpdate: vi.fn().mockResolvedValue({ success: true, results: [] }),
}));

// Mock server auth
vi.mock('@/lib/server/auth', () => ({
  getAuthedUser: vi.fn().mockReturnValue({ id: 'test-user-123' }),
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  withScope: vi.fn((callback) => {
    const scope = {
      setTag: vi.fn(),
      setUser: vi.fn(),
      setContext: vi.fn(),
    };
    callback(scope);
  }),
}));

// Global test setup
beforeAll(() => {
  // Setup global test environment
  console.log('Setting up test environment...');
});

afterEach(() => {
  // Clean up after each test
  vi.clearAllMocks();
});

afterAll(() => {
  // Cleanup after all tests
  console.log('Cleaning up test environment...');
});
