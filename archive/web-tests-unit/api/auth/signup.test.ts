import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/signup/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';

// Mock the password hashing
vi.mock('@/lib/auth/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed-password'),
}));

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new user successfully', async () => {
    // Mock Prisma responses
    (prisma.user.findUnique as any).mockResolvedValue(null); // User doesn't exist
    (prisma.user.create as any).mockResolvedValue({
      id: 'user123',
      email: 'test@example.com',
    });
    (prisma.wallet.create as any).mockResolvedValue({
      id: 'wallet123',
      userId: 'user123',
      funds: 0,
      diamonds: 0,
    });
    (prisma.userProfile.create as any).mockResolvedValue({
      id: 'profile123',
      userId: 'user123',
    });

    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Account created successfully');
    expect(data.userId).toBe('user123');

    // Verify password was hashed
    expect(hashPassword).toHaveBeenCalledWith('password123');

    // Verify user was created
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        emailVerifiedAt: null,
      },
    });

    // Verify wallet and profile were created
    expect(prisma.wallet.create).toHaveBeenCalled();
    expect(prisma.userProfile.create).toHaveBeenCalled();
  });

  it('should return error if user already exists', async () => {
    // Mock existing user
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'existing-user',
      email: 'test@example.com',
    });

    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Account already exists');
  });

  it('should validate email format', async () => {
    const requestBody = {
      email: 'invalid-email',
      password: 'password123',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid input data');
  });

  it('should validate password requirements', async () => {
    const requestBody = {
      email: 'test@example.com',
      password: '123', // Too short
    };

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid input data');
  });

  it('should handle database errors gracefully', async () => {
    (prisma.user.findUnique as any).mockRejectedValue(new Error('Database error'));

    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to create account');
  });

  it('should handle rate limiting', async () => {
    const { checkSignupRateLimit } = await import('@/lib/security/rateLimit');
    (checkSignupRateLimit as any).mockResolvedValue({
      allowed: false,
      remaining: 0,
      retryAfter: 3600,
      resetTime: Date.now() + 3600000,
    });

    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Too many signup attempts. Please try again later.');
  });
});
