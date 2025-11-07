'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';

export interface Discovery {
  id: string;
  itemId: string;
  item: {
    id: string;
    name: string;
    type: string;
    rarity: string;
    description: string | null;
    icon: string | null;
    emoji: string | null;
    category: string | null;
  };
  discoveredAt: string;
}

interface DiscoveriesData {
  discoveries: Discovery[];
  total: number;
  limit: number;
  offset: number;
}

export function useDiscoveryIndex() {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<DiscoveriesData>('/api/items/discoveries');
      if (data) {
        setDiscoveries(data.discoveries);
        setTotal(data.total);
      } else {
        setError('Failed to load discoveries');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load discoveries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { discoveries, loading, error, total, reload: load };
}

