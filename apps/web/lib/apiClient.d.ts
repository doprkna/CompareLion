/**
 * Universal API Fetch Wrapper
 *
 * Provides a consistent interface for making API calls with:
 * - Automatic error handling
 * - Structured error logging
 * - Type-safe responses
 * - Null return on failure (no throwing)
 */
/**
 * Fetch wrapper with error handling
 * Returns { ok: boolean, data: T | null, error?: string, status?: number }
 * Handles 401 explicitly for session expiry
 *
 * @example
 * const res = await apiFetch<MyType>('/api/endpoint');
 * if (!res.ok) { // handle error }
 */
/**
 * @deprecated Use defaultClient from @parel/api/client instead.
 * Legacy API fetch wrapper. This will be removed in v0.42.0+.
 * v0.41.15 - C3 Step 16: API Client Cleanup & Deprecation Pass
 * Migration: import { defaultClient } from '@parel/api/client';
 */
export declare function apiFetch<T>(path: string, options?: RequestInit): Promise<{
    ok: boolean;
    data: T | null;
    error?: string;
    status?: number;
}>;
/**
 * Fetch wrapper that throws on error
 * Use when you want to handle errors at a higher level
 *
 * @example
 * try {
 *   const data = await apiFetchStrict<MyType>('/api/endpoint');
 * } catch (err) {
 *   // handle error
 * }
 */
export declare function apiFetchStrict<T>(path: string, options?: RequestInit): Promise<T>;
/**
 * Helper for POST requests
 */
export declare function apiPost<T, D = any>(path: string, data: D, options?: RequestInit): Promise<{
    ok: boolean;
    data: T | null;
    error?: string;
    status?: number;
}>;
/**
 * Helper for PATCH requests
 */
export declare function apiPatch<T, D = any>(path: string, data: D, options?: RequestInit): Promise<{
    ok: boolean;
    data: T | null;
    error?: string;
    status?: number;
}>;
/**
 * Helper for DELETE requests
 */
export declare function apiDelete<T>(path: string, options?: RequestInit): Promise<{
    ok: boolean;
    data: T | null;
    error?: string;
    status?: number;
}>;
