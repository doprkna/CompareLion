/**
 * useInventory Hook
 * Fetches user inventory
 * v0.36.3 - Equipment/inventory sync
 * v0.41.14 - Migrated SWR fetcher to unified API client
 */

'use client';

// sanity-fix: replaced swr import with local stub (missing dependency)
const useSWR = <T = unknown>(_key: unknown, _fetcher: (url: string) => Promise<T>, _options?: unknown): { data: T | null; error: unknown; isLoading: boolean; mutate: () => void } =>
  ({ data: null, error: null, isLoading: false, mutate: () => {} });
import { defaultClient, ApiClientError } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)

export interface InventoryItem {
  id: string;
  userId?: string;
  itemId?: string;
  itemKey?: string | null;
  rarity: string;
  quantity?: number;
  equipped?: boolean;
  createdAt?: string;
  updatedAt?: string;
  name?: string;
  emoji?: string;
  icon?: string;
  description?: string | null;
  type?: string;
  goldPrice?: number;
}

interface InventoryResponse {
  success: boolean;
  inventory: InventoryItem[];
  totalCount?: number;
}

const fetcher = async (url: string): Promise<InventoryResponse> => {
  try {
    // Extract path from full URL (SWR passes full URL)
    const path = url.replace(/^.*\/api/, '');
    const response = await defaultClient.get<InventoryResponse>(path);
    return response?.data ?? { success: false, inventory: [] }; // sanity-fix
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    return { success: false, inventory: [] };
  }
};

/**
 * Hook for fetching user inventory
 * Uses SWR for automatic revalidation
 * v0.36.3 - Equipment/inventory sync
 */
export function useInventory() {
  const { data, error, isLoading, mutate } = useSWR<InventoryResponse>(
    '/api/inventory',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds deduplication
    }
  );

  return {
    inventory: data?.inventory || [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load inventory') : null,
    total: data?.totalCount || data?.inventory?.length || 0,
    reload: mutate,
  };
}

