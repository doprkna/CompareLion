import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/purchase/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { updateWalletWithLock } from '@/lib/utils/walletTransactions';

// Mock wallet transactions
vi.mock('@/lib/utils/walletTransactions', () => ({
  updateWalletWithLock: vi.fn(),
}));

// Mock authentication
vi.mock('@/lib/server/auth', () => ({
  getAuthedUser: vi.fn(),
}));

describe('POST /api/purchase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process purchase successfully', async () => {
    // Mock authentication
    const { getAuthedUser } = await import('@/lib/server/auth');
    (getAuthedUser as any).mockReturnValue({ id: 'user123' });

    // Mock product exists and is active
    (prisma.product.findUnique as any).mockResolvedValue({
      id: 'product123',
      title: 'Premium Package',
      active: true,
      stackable: false,
      prices: [
        { currency: 'usd', amountMinor: 1000 },
      ],
    });

    // Mock no existing entitlement
    (prisma.entitlement.findUnique as any).mockResolvedValue(null);

    // Mock wallet update success
    (updateWalletWithLock as any).mockResolvedValue({
      success: true,
      newBalance: { funds: 9000, diamonds: 0 },
    });

    // Mock purchase and entitlement creation
    (prisma.$transaction as any).mockImplementation(async (callback) => {
      const mockTx = {
        purchase: {
          create: vi.fn().mockResolvedValue({
            id: 'purchase123',
            productId: 'product123',
            quantity: 1,
            totalMinor: 1000,
            status: 'SUCCEEDED',
            createdAt: new Date(),
          }),
        },
        entitlement: {
          create: vi.fn().mockResolvedValue({
            id: 'entitlement123',
            productId: 'product123',
            createdAt: new Date(),
          }),
        },
      };
      return callback(mockTx);
    });

    const requestBody = {
      productId: 'product123',
      quantity: 1,
    };

    const request = new NextRequest('http://localhost:3000/api/purchase', {
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
    expect(data.purchase.productId).toBe('product123');
    expect(data.purchase.totalAmount).toBe(1000);
    expect(data.entitlements).toHaveLength(1);
    expect(data.wallet.funds).toBe(9000);

    // Verify wallet was updated
    expect(updateWalletWithLock).toHaveBeenCalledWith({
      userId: 'user123',
      tenantId: 'default',
      fundsDelta: -1000,
      refType: 'purchase',
      refId: expect.stringMatching(/^purchase_\d+$/),
      note: 'Purchase: Premium Package (1x)',
    });
  });

  it('should return error for non-existent product', async () => {
    const { getAuthedUser } = await import('@/lib/server/auth');
    (getAuthedUser as any).mockReturnValue({ id: 'user123' });

    (prisma.product.findUnique as any).mockResolvedValue(null);

    const requestBody = {
      productId: 'nonexistent',
      quantity: 1,
    };

    const request = new NextRequest('http://localhost:3000/api/purchase', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Product not found or inactive');
  });

  it('should return error for inactive product', async () => {
    const { getAuthedUser } = await import('@/lib/server/auth');
    (getAuthedUser as any).mockReturnValue({ id: 'user123' });

    (prisma.product.findUnique as any).mockResolvedValue({
      id: 'product123',
      title: 'Inactive Product',
      active: false,
    });

    const requestBody = {
      productId: 'product123',
      quantity: 1,
    };

    const request = new NextRequest('http://localhost:3000/api/purchase', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Product not found or inactive');
  });

  it('should return error for non-stackable product already owned', async () => {
    const { getAuthedUser } = await import('@/lib/server/auth');
    (getAuthedUser as any).mockReturnValue({ id: 'user123' });

    (prisma.product.findUnique as any).mockResolvedValue({
      id: 'product123',
      title: 'Premium Package',
      active: true,
      stackable: false,
      prices: [{ currency: 'usd', amountMinor: 1000 }],
    });

    (prisma.entitlement.findUnique as any).mockResolvedValue({
      id: 'existing-entitlement',
      userId: 'user123',
      productId: 'product123',
    });

    const requestBody = {
      productId: 'product123',
      quantity: 1,
    };

    const request = new NextRequest('http://localhost:3000/api/purchase', {
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
    expect(data.error).toBe('You already own this product');
  });

  it('should handle insufficient funds', async () => {
    const { getAuthedUser } = await import('@/lib/server/auth');
    (getAuthedUser as any).mockReturnValue({ id: 'user123' });

    (prisma.product.findUnique as any).mockResolvedValue({
      id: 'product123',
      title: 'Premium Package',
      active: true,
      stackable: false,
      prices: [{ currency: 'usd', amountMinor: 1000 }],
    });

    (prisma.entitlement.findUnique as any).mockResolvedValue(null);

    (updateWalletWithLock as any).mockResolvedValue({
      success: false,
      error: 'Insufficient funds',
      newBalance: { funds: 500, diamonds: 0 },
    });

    const requestBody = {
      productId: 'product123',
      quantity: 1,
    };

    const request = new NextRequest('http://localhost:3000/api/purchase', {
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
    expect(data.error).toBe('Insufficient funds');
  });

  it('should validate quantity limits', async () => {
    const { getAuthedUser } = await import('@/lib/server/auth');
    (getAuthedUser as any).mockReturnValue({ id: 'user123' });

    const requestBody = {
      productId: 'product123',
      quantity: 101, // Too high
    };

    const request = new NextRequest('http://localhost:3000/api/purchase', {
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
    expect(data.error).toBe('Invalid purchase data');
  });

  it('should handle database errors gracefully', async () => {
    const { getAuthedUser } = await import('@/lib/server/auth');
    (getAuthedUser as any).mockReturnValue({ id: 'user123' });

    (prisma.product.findUnique as any).mockRejectedValue(new Error('Database error'));

    const requestBody = {
      productId: 'product123',
      quantity: 1,
    };

    const request = new NextRequest('http://localhost:3000/api/purchase', {
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
    expect(data.error).toBe('Purchase failed');
  });

  it('should support multiple quantity purchases for stackable items', async () => {
    const { getAuthedUser } = await import('@/lib/server/auth');
    (getAuthedUser as any).mockReturnValue({ id: 'user123' });

    (prisma.product.findUnique as any).mockResolvedValue({
      id: 'product123',
      title: 'Diamond Pack',
      active: true,
      stackable: true,
      prices: [{ currency: 'usd', amountMinor: 500 }],
    });

    (prisma.entitlement.findUnique as any).mockResolvedValue(null);

    (updateWalletWithLock as any).mockResolvedValue({
      success: true,
      newBalance: { funds: 8000, diamonds: 0 },
    });

    (prisma.$transaction as any).mockImplementation(async (callback) => {
      const mockTx = {
        purchase: {
          create: vi.fn().mockResolvedValue({
            id: 'purchase123',
            productId: 'product123',
            quantity: 2,
            totalMinor: 1000,
            status: 'SUCCEEDED',
            createdAt: new Date(),
          }),
        },
        entitlement: {
          create: vi.fn().mockResolvedValue({
            id: 'entitlement123',
            productId: 'product123',
            createdAt: new Date(),
          }),
        },
      };
      return callback(mockTx);
    });

    const requestBody = {
      productId: 'product123',
      quantity: 2,
    };

    const request = new NextRequest('http://localhost:3000/api/purchase', {
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
    expect(data.purchase.quantity).toBe(2);
    expect(data.purchase.totalAmount).toBe(1000);
    expect(data.entitlements).toHaveLength(2);
  });
});
