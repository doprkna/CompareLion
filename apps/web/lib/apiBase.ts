/**
 * API Base URL Utility
 * Unified API fetch layer for PareL
 */

import { logger } from '@/lib/logger';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const getApiUrl = (path: string) => `${API_BASE_URL}${path}`;

export const safeApiFetch = async <T>(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; data?: T; error?: string }> => {
  try {
    const res = await fetch(getApiUrl(path), {
      ...init,
      credentials: 'include', // Include cookies for session authentication
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true, data: await res.json() };
  } catch (err: any) {
    logger.error('[safeApiFetch] API fetch failed', { path, error: err });
    return { ok: false, error: err.message || 'Unknown error' };
  }
};

export const apiFetch = safeApiFetch; // alias for legacy imports
