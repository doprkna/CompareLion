/**
 * useShop Hook
 * Manages shop items fetching and purchase logic
 * v0.26.2 - Economy Feedback & Shop Loop
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGold } from './useGold';
import { useRewardToast } from './useRewardToast';

export interface ShopItem {
  id: string;
  key: string | null;
  name: string;
  emoji: string;
  description: string | null;
  price: number;
  rarity: string;
  type: string;
  power: number | null;
  defense: number | null;
}

export interface UseShopReturn {
  items: ShopItem[];
  loading: boolean;
  error: string | null;
  purchaseItem: (key: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useShop(): UseShopReturn {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshGold } = useGold();
  const { pushToast } = useRewardToast();

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/shop');
      const data = await res.json();

      if (data.success) {
        setItems(data.items || []);
      } else {
        setError(data.error || 'Failed to fetch shop items');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      console.error('[useShop] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const purchaseItem = useCallback(async (key: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/shop/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      const data = await res.json();

      if (data.success) {
        // Show success toast (v0.26.9 - using 'shop' type)
        pushToast({
          type: 'shop',
          message: `💰 Purchased ${data.item.name}!`,
        });

        // Refresh gold balance
        await refreshGold();

        // Refetch shop items (in case prices change or stock is limited)
        await fetchItems();

        return true;
      } else {
        // Show error toast (v0.26.9 - using 'error' type)
        pushToast({
          type: 'error',
          message: `${data.error || 'Purchase failed!'}`,
        });

        return false;
      }
    } catch (err) {
      console.error('[useShop] Purchase error:', err);
      pushToast({
        type: 'error',
        message: 'Network error - purchase failed!',
      });
      return false;
    }
  }, [fetchItems, refreshGold, pushToast]);

  return {
    items,
    loading,
    error,
    purchaseItem,
    refetch: fetchItems,
  };
}

