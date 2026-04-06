/**
 * API Base URL Utility
 * Unified API fetch layer for PareL
 */
export declare const API_BASE_URL: string;
export declare const getApiUrl: (path: string) => string;
/**
 * @deprecated Use defaultClient from @parel/api/client instead.
 * Legacy API fetch wrapper. This will be removed in v0.42.0+.
 * v0.41.15 - C3 Step 16: API Client Cleanup & Deprecation Pass
 * Migration: import { defaultClient } from '@parel/api/client';
 */
export declare const safeApiFetch: <T>(path: string, init?: RequestInit) => Promise<{
    ok: boolean;
    data?: T;
    error?: string;
}>;
export declare const apiFetch: <T>(path: string, init?: RequestInit) => Promise<{
    ok: boolean;
    data?: T;
    error?: string;
}>;
