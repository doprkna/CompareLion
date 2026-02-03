import { vi } from 'vitest';
import { NextRequest } from 'next/server';
export const createMockRequest = (url, options = {}) => {
    const { method = 'GET', body, headers = {} } = options;
    return new NextRequest(url, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });
};
export const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
};
export const mockProduct = {
    id: 'product-123',
    title: 'Premium Package',
    active: true,
    stackable: false,
    prices: [{ currency: 'usd', amountMinor: 1000 }],
};
export const mockWallet = {
    id: 'wallet-123',
    userId: 'test-user-123',
    tenantId: 'default',
    funds: 10000,
    diamonds: 100,
};
export const createMockPrismaResponse = (data) => {
    return vi.fn().mockResolvedValue(data);
};
export const createMockPrismaError = (error) => {
    return vi.fn().mockRejectedValue(new Error(error));
};
