import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/login/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';

// Mock the password verification
vi.mock('@/lib/auth/password', () => ({
  verifyPassword: vi.fn(),
}));

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should login user successfully with valid credentials', async () => {
    // Mock Prisma responses
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user123',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
    });
    (verifyPassword as any).mockResolvedValue(true);
    (prisma.user.update as any).mockResolvedValue({});

    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
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
    expect(data.message).toBe('Login successful');
    expect(data.userId).toBe('user123');

    // Verify password was checked
    expect(verifyPassword).toHaveBeenCalledWith('hashed-password', 'password123');

    // Verify last login was updated
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user123' },
      data: { lastLoginAt: expect.any(Date) },
    });
  });

  it('should return error for non-existent user', async () => {
    // Mock user not found
    (prisma.user.findUnique as any).mockResolvedValue(null);

    const requestBody = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid credentials');
  });

  it('should return error for invalid password', async () => {
    // Mock user exists but wrong password
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user123',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
    });
    (verifyPassword as any).mockResolvedValue(false);

    const requestBody = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid credentials');
  });

  it('should validate email format', async () => {
    const requestBody = {
      email: 'invalid-email',
      password: 'password123',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
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
    expect(data.error).toBe('Invalid credentials');
  });

  it('should validate required fields', async () => {
    const requestBody = {
      email: 'test@example.com',
      // Missing password
    };

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
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
    expect(data.error).toBe('Invalid credentials');
  });

  it('should handle account lockout', async () => {
    const { trackFailedLogin } = await import('@/lib/security/rateLimit');
    (trackFailedLogin as any).mockResolvedValue({
      attempts: 10,
      locked: true,
      lockoutUntil: Date.now() + 900000, // 15 minutes
    });

    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
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
    expect(data.error).toBe('Account temporarily locked due to too many failed attempts. Please try again later.');
  });

  it('should handle database errors gracefully', async () => {
    (prisma.user.findUnique as any).mockRejectedValue(new Error('Database error'));

    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
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
    expect(data.error).toBe('Login failed');
  });
});
