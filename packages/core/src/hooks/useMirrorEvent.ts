'use client';
// sanity-fix
/**
 * useMirrorEvent Hook
 * Fetches active mirror event
 * v0.41.14 - Migrated to unified API client
 */

import { useCallback, useEffect, useState } from 'react';
import { defaultClient, ApiClientError } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)
import type { MirrorEventResponseDTO } from '@parel/types'; // sanity-fix: replaced @parel/types/dto with @parel/types (dto not exported as subpath)

export function useMirrorEvent() {
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await defaultClient.get<MirrorEventResponseDTO>('/mirror-events/active', {
        cache: 'no-store',
      });
      setEvent(response?.data?.event ?? null); // sanity-fix
    } catch (e: unknown) {
      const errorMessage = e instanceof ApiClientError
        ? e.message
        : e instanceof Error
          ? e.message
          : 'Failed to load mirror event';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { event, loading, error, reload: load };
}
