/**
 * Universal API Fetch Wrapper
 * 
 * Provides a consistent interface for making API calls with:
 * - Automatic error handling
 * - Structured error logging
 * - Type-safe responses
 * - Null return on failure (no throwing)
 */

import { logError, AppError } from "./errors";

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
export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<{ ok: boolean; data: T | null; error?: string; status?: number }> {
  try {
    const res = await fetch(path, {
      ...options,
      headers: { 
        "Content-Type": "application/json", 
        ...(options?.headers || {}) 
      },
    });
    
    // Handle 401 explicitly - session expired
    if (res.status === 401) {
      console.warn(`[apiFetch] HTTP 401 on ${path} - Session expired`); // sanity-fix
      return { 
        ok: false, 
        data: null, 
        error: "Session expired or not authenticated", 
        status: 401 
      };
    }
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => res.statusText);
      logError(
        new AppError(
          `API ${res.status}: ${errorText}`, 
          "API_ERROR", 
          { path, status: res.status }
        ),
        `apiFetch: ${path}`
      );
      return { 
        ok: false, 
        data: null, 
        error: errorText || res.statusText, 
        status: res.status 
      };
    }
    
    const data = await res.json();
    return { ok: true, data: data as T };
  } catch (err) {
    logError(err, `apiFetch: ${path}`);
    return { 
      ok: false, 
      data: null, 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
}

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
export async function apiFetchStrict<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { 
      "Content-Type": "application/json", 
      ...(options?.headers || {}) 
    },
  });
  
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new AppError(
      `API ${res.status}: ${errorText}`, 
      "API_ERROR", 
      { path, status: res.status }
    );
  }
  
  return await res.json() as T;
}

/**
 * Helper for POST requests
 */
export async function apiPost<T, D = any>(
  path: string,
  data: D,
  options?: RequestInit
): Promise<{ ok: boolean; data: T | null; error?: string; status?: number }> {
  return apiFetch<T>(path, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Helper for PATCH requests
 */
export async function apiPatch<T, D = any>(
  path: string,
  data: D,
  options?: RequestInit
): Promise<{ ok: boolean; data: T | null; error?: string; status?: number }> {
  return apiFetch<T>(path, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Helper for DELETE requests
 */
export async function apiDelete<T>(
  path: string,
  options?: RequestInit
): Promise<{ ok: boolean; data: T | null; error?: string; status?: number }> {
  return apiFetch<T>(path, {
    ...options,
    method: 'DELETE',
  });
}

