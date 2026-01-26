/**
 * useInventory Hook
 * Fetches user inventory
 * v0.36.3 - Equipment/inventory sync
 * v0.41.14 - Migrated SWR fetcher to unified API client
 */
'use client';
import useSWR from 'swr';
import { defaultClient, ApiClientError } from '@parel/api'; // sanity-fix
const fetcher = async (url) => {
    try {
        // Extract path from full URL (SWR passes full URL)
        const path = url.replace(/^.*\/api/, '');
        const response = await defaultClient.get(path);
        return response?.data ?? { success: false, inventory: [] }; // sanity-fix
    }
    catch (error) {
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
    const { data, error, isLoading, mutate } = useSWR('/api/inventory', fetcher, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 5000, // 5 seconds deduplication
    });
    return {
        inventory: data?.inventory || [],
        loading: isLoading,
        error: error ? (error instanceof Error ? error.message : 'Failed to load inventory') : null,
        total: data?.totalCount || data?.inventory?.length || 0,
        reload: mutate,
    };
}
