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
 * Returns null on error instead of throwing
 * 
 * @example
 * const data = await apiFetch<MyType>('/api/endpoint');
 * if (!data) { // handle error }
 */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(path, {
      ...options,
      headers: { 
        "Content-Type": "application/json", 
        ...(options?.headers || {}) 
      },
    });
    
    if (!res.ok) {
      throw new AppError(
        `API ${res.status}: ${res.statusText}`, 
        "API_ERROR", 
        { path, status: res.status }
      );
    }
    
    const data = await res.json();
    return data as T;
  } catch (err) {
    logError(err, `apiFetch: ${path}`);
    return null;
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
): Promise<T | null> {
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
): Promise<T | null> {
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
): Promise<T | null> {
  return apiFetch<T>(path, {
    ...options,
    method: 'DELETE',
  });
}

