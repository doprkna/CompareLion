'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';

export interface InventoryItem {
  id: string;
  userId: string;
  itemId: string;
  itemKey: string | null;
  rarity: string;
  quantity: number;
  equipped: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InventoryData {
  items: InventoryItem[];
  total: number;
}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the inventory API endpoint if it exists, otherwise create a placeholder
      const data = await apiFetch<InventoryData>('/api/inventory').catch(() => null);
      if (data) {
        setInventory(data.items || []);
        setTotal(data.total || 0);
      } else {
        // Fallback: empty inventory
        setInventory([]);
        setTotal(0);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load inventory');
      setInventory([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { inventory, loading, error, total, reload: load };
}

