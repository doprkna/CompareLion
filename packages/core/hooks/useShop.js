'use client';
// sanity-fix
/**
 * useShop Hook
 * Manages shop items fetching and purchase logic
 * v0.26.2 - Economy Feedback & Shop Loop
 * v0.41.12 - Migrated to unified API client
 */
'use client';
import { useState, useEffect, useCallback } from 'react';
import { defaultClient, ApiClientError } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)
import { useGold } from './useGold';
import { useRewardToast } from './useRewardToast';
export function useShop() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { refreshGold } = useGold();
    const { pushToast } = useRewardToast();
    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await defaultClient.get('/shop');
            const raw = response.data.items || [];
            setItems(raw.map((item) => ({ ...item, emoji: item.emoji ?? '' })));
        }
        catch (err) {
            const errorMessage = err instanceof ApiClientError
                ? err.message
                : err instanceof Error
                    ? err.message
                    : 'Network error';
            setError(errorMessage);
            console.error('[useShop] Fetch error:', err);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchItems();
    }, [fetchItems]);
    const purchaseItem = useCallback(async (key) => {
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
            }
            else {
                // Show error toast (v0.26.9 - using 'error' type)
                pushToast({
                    type: 'error',
                    message: `${data.error || 'Purchase failed!'}`,
                });
                return false;
            }
        }
        catch (err) {
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
