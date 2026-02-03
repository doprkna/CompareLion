import { NextRequest } from 'next/server';
export declare const createMockRequest: (url: string, options?: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
}) => NextRequest;
export declare const mockUser: {
    id: string;
    email: string;
    passwordHash: string;
};
export declare const mockProduct: {
    id: string;
    title: string;
    active: boolean;
    stackable: boolean;
    prices: {
        currency: string;
        amountMinor: number;
    }[];
};
export declare const mockWallet: {
    id: string;
    userId: string;
    tenantId: string;
    funds: number;
    diamonds: number;
};
export declare const createMockPrismaResponse: (data: any) => import("vitest").Mock<(...args: any[]) => any>;
export declare const createMockPrismaError: (error: string) => import("vitest").Mock<(...args: any[]) => any>;
