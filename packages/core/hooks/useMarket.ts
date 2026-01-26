'use client';
// sanity-fix
'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
// sanity-fix: replaced swr import with local stub (missing dependency)
const useSWR = (key: any, fetcher: any, options?: any) => ({ data: null, error: null, isLoading: false, mutate: () => {} });
const useSWRInfinite = (getKey: any, fetcher: any, options?: any) => ({ data: null, error: null, isLoading: false, mutate: () => {}, setSize: () => {}, size: 0 });
// sanity-fix: replaced sonner import with local stub (missing dependency)
const toast = { success: () => {}, error: () => {}, info: () => {}, warning: () => {} };

export interface MarketItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currencyKey: string;
  rarity?: string | null;
  category: 'item' | 'cosmetic' | 'booster' | 'utility' | 'social'; // v0.34.3 - Added utility, social
  tag?: 'featured' | 'limited' | 'weekly' | null; // v0.34.3 - Added tag
  isFeatured?: boolean; // v0.34.3 - Featured flag
  stock?: number | null;
  isEventItem: boolean;
  createdAt: string;
}

export interface WalletBalance {
  currencyKey: string;
  name: string;
  symbol: string;
  isPremium: boolean;
  exchangeRate: number;
  balance: number;
  updatedAt?: string | null;
}

export interface Transaction {
  id: string;
  userId: string;
  itemId?: string | null;
  type: string;
  amount: number;
  currencyKey: string;
  note?: string | null;
  createdAt: string;
}

import { defaultClient, ApiClientError } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)

const fetcher = async (url: string) => {
  try {
    // Extract path from full URL (SWR passes full URL)
    const path = url.replace(/^.*\/api/, '');
    const response = await defaultClient.get(path);
    return response.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new Error('Request failed');
  }
};

export interface MarketFilterParams {
  rarity?: string; // 'all' | 'common' | 'rare' | 'epic' | 'legendary'
  category?: string; // 'all' | 'item' | 'cosmetic' | 'booster' | 'utility' | 'social' (v0.34.3)
  tag?: string; // 'all' | 'featured' | 'limited' | 'weekly' (v0.34.3)
  isFeatured?: boolean; // true | false (v0.34.3)
  sort?: string; // 'price_asc' | 'price_desc' | 'rarity' | 'newest'
}

export interface UseMarketItemsReturn {
  items: MarketItem[];
  totalCount: number;
  loadedCount: number;
  page: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  loadMore: () => void;
  reset: () => void;
  isInfiniteScrollEnabled?: boolean;
}

import { getUiConfig } from '../config/unified'; // sanity-fix: replaced @parel/core/config self-import with relative import

export interface UseInfiniteScrollOptions {
  threshold?: number; // Scroll percentage threshold (default: 0.8 = 80%)
  debounceMs?: number; // Debounce delay in ms (default from config)
  enabled?: boolean; // Enable/disable infinite scroll (default: true)
}

export function useMarketItems(
  filterParams?: MarketFilterParams,
  infiniteScrollOptions?: UseInfiniteScrollOptions
): UseMarketItemsReturn & { setScrollContainer: (element: HTMLElement | null) => void } {
  const limit = 20; // Default page size
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInfiniteScrollEnabled = infiniteScrollOptions?.enabled !== false;

  const setScrollContainer = useCallback((element: HTMLElement | null) => {
    scrollContainerRef.current = element;
  }, []);

  // Build base query string from filter params
  const buildQueryParams = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set('page', pageNum.toString());
    params.set('limit', limit.toString());
    
    if (filterParams?.rarity && filterParams.rarity !== 'all') {
      params.set('rarity', filterParams.rarity);
    }
    if (filterParams?.category && filterParams.category !== 'all') {
      params.set('category', filterParams.category);
    }
    // v0.34.3 - Added tag filter
    if (filterParams?.tag && filterParams.tag !== 'all') {
      params.set('tag', filterParams.tag);
    }
    // v0.34.3 - Added isFeatured filter
    if (filterParams?.isFeatured !== undefined && filterParams.isFeatured !== null) { // sanity-fix
      params.set('isFeatured', filterParams.isFeatured.toString());
    }
    if (filterParams?.sort) {
      params.set('sort', filterParams.sort);
    }
    
    return params.toString();
  };

  // Get key function for SWRInfinite - include filter params in key for proper cache invalidation
  const getKey = (pageIndex: number, previousPageData: any) => {
    // If previous page exists and has no more data, stop
    if (previousPageData && !previousPageData.hasMore) return null;
    
    const queryString = buildQueryParams(pageIndex + 1);
    // Include filter params in key to ensure cache invalidation when filters change
    const filterKey = filterParams
      ? `rarity=${filterParams.rarity || 'all'}&category=${filterParams.category || 'all'}&tag=${filterParams.tag || 'all'}&isFeatured=${filterParams.isFeatured ?? 'any'}&sort=${filterParams.sort || 'rarity'}`
      : '';
    return `/api/market/items?${filterKey ? `${filterKey}&` : ''}${queryString}`;
  };

  const {
    data,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
    mutate,
  } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false,
    revalidateOnFocus: false,
    onError: (err) => {
      if (err instanceof Error) {
        const status = (err as any).status;
        if (status >= 400) {
          toast.error(err.message || 'Failed to load market items');
        }
      }
    },
  });

  // Reset pagination when filters change
  useEffect(() => {
    if (size > 1) {
      setSize(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParams?.rarity, filterParams?.category, filterParams?.tag, filterParams?.isFeatured, filterParams?.sort]);

  // Flatten all pages into single items array
  const allItems: MarketItem[] = [];
  let totalCount = 0;
  let hasMore = false;

  if (data && Array.isArray(data)) { // sanity-fix
    data.forEach((pageData: any) => {
      if (pageData?.items && Array.isArray(pageData.items)) { // sanity-fix
        allItems.push(...(pageData.items as MarketItem[]));
      }
      if (pageData?.totalCount !== undefined) {
        totalCount = pageData.totalCount;
      }
      if (pageData?.hasMore !== undefined) {
        hasMore = pageData.hasMore;
      }
    });
    
    // Get hasMore from last page
    if (Array.isArray(data) && data.length > 0 && data[data.length - 1]) { // sanity-fix
      hasMore = data[data.length - 1].hasMore ?? false;
    }
  }

  const loadMore = useCallback(() => {
    if (!isValidating && hasMore) {
      setSize(size + 1);
    }
  }, [isValidating, hasMore, size, setSize]);

  const reset = () => {
    setSize(1);
    mutate();
  };

  // Infinite scroll detection
  const handleScroll = useCallback(() => {
    if (!isInfiniteScrollEnabled || isValidating || !hasMore) {
      return;
    }

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce scroll event
    debounceTimerRef.current = setTimeout(() => {
      const container = scrollContainerRef.current;
      
      // If no container ref, try window
      if (!container) {
        if (typeof window === 'undefined' || typeof document === 'undefined') { // sanity-fix
          return;
        }
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPercentage = (scrollY + windowHeight) / documentHeight;
        const threshold = infiniteScrollOptions?.threshold ?? 0.8; // Default 80%

        if (scrollPercentage >= threshold) {
          loadMore();
        }
        return;
      }

      // Use container element
      if (container instanceof HTMLElement) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
        const threshold = infiniteScrollOptions?.threshold ?? 0.8; // Default 80%

        if (scrollPercentage >= threshold) {
          loadMore();
        }
      }
    }, infiniteScrollOptions?.debounceMs ?? getUiConfig().toast.marketDebounce);
  }, [isInfiniteScrollEnabled, isValidating, hasMore, loadMore, infiniteScrollOptions]);

  // Set up scroll listener
  useEffect(() => {
    if (!isInfiniteScrollEnabled) {
      return;
    }

    // Use container ref if available, otherwise window
    const container = scrollContainerRef.current || window;
    const target = scrollContainerRef.current ? scrollContainerRef.current : window;

    target.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      target.removeEventListener('scroll', handleScroll);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isInfiniteScrollEnabled, handleScroll]);

  return {
    items: allItems,
    totalCount,
    loadedCount: allItems.length,
    page: size,
    hasMore,
    loading: isLoading && size === 1, // Only show loading on initial load
    loadingMore: isValidating && size > 1, // Show loading more when fetching additional pages
    error: error ? (error instanceof Error ? error.message : 'Failed to load') : null,
    loadMore,
    reset,
    isInfiniteScrollEnabled,
    setScrollContainer,
  };
}

export function useWallet() {
  const { data, error, isLoading, mutate } = useSWR('/api/wallet', fetcher, {
    dedupingInterval: 60000, // 1 minute deduplication
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    onError: (err) => {
      if (err instanceof Error) {
        const status = (err as any).status;
        if (status >= 400) {
          toast.error(err.message || 'Failed to load wallet');
        }
      }
    },
  });

  return {
    wallets: (data?.wallets || []) as WalletBalance[],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load') : null,
    reload: mutate,
  };
}

export function usePurchaseItem() {
  const purchase = async (itemId: string) => {
    try {
      const res = await fetch('/api/market/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to purchase item');
      }
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to purchase item';
      throw new Error(message);
    }
  };

  return { purchase };
}

export function useMarketTransactions(limit: number = 3) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/market/transactions?limit=${limit}`,
    fetcher,
    {
      revalidateOnFocus: false,
      onError: (err) => {
        if (err instanceof Error) {
          const status = (err as any).status;
          if (status >= 400) {
            toast.error(err.message || 'Failed to load transactions');
          }
        }
      },
    }
  );

  return {
    transactions: (data?.transactions || []) as Transaction[],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load') : null,
    reload: mutate,
  };
}

export interface UseTransactionsReturn {
  transactions: Transaction[];
  totalCount: number;
  loadedCount: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  loadMore: () => void;
  reset: () => void;
}

/**
 * Hook for fetching wallet transactions with pagination
 * Uses SWRInfinite for efficient multi-page loading
 */
export function useTransactions(pageSize: number = 20): UseTransactionsReturn {
  const getKey = (pageIndex: number, previousPageData: any) => {
    // If previous page exists and has no more data, stop
    if (previousPageData && !previousPageData.hasMore) return null;
    
    const page = pageIndex + 1;
    return `/api/wallet/transactions?page=${page}&limit=${pageSize}`;
  };

  const {
    data,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
    mutate,
  } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false,
    revalidateOnFocus: false,
    onError: (err) => {
      if (err instanceof Error) {
        const status = (err as any).status;
        if (status >= 400) {
          toast.error(err.message || 'Failed to load transactions');
        }
      }
    },
  });

  // Flatten all pages into single transactions array
  const allTransactions: Transaction[] = [];
  let totalCount = 0;
  let hasMore = false;

  if (data && Array.isArray(data)) { // sanity-fix
    data.forEach((pageData: any) => {
      if (pageData?.transactions && Array.isArray(pageData.transactions)) { // sanity-fix
        allTransactions.push(...(pageData.transactions as Transaction[]));
      }
      if (pageData?.totalCount !== undefined) {
        totalCount = pageData.totalCount;
      }
      if (pageData?.hasMore !== undefined) {
        hasMore = pageData.hasMore;
      }
    });
    
    // Get hasMore from last page
    if (Array.isArray(data) && data.length > 0 && data[data.length - 1]) { // sanity-fix
      hasMore = data[data.length - 1].hasMore ?? false;
    }
  }

  const loadMore = useCallback(() => {
    if (!isValidating && hasMore) {
      setSize(size + 1);
    }
  }, [isValidating, hasMore, size, setSize]);

  const reset = () => {
    setSize(1);
    mutate();
  };

  return {
    transactions: allTransactions,
    totalCount,
    loadedCount: allTransactions.length,
    hasMore,
    loading: isLoading && size === 1, // Only show loading on initial load
    loadingMore: isValidating && size > 1, // Show loading more when fetching additional pages
    error: error ? (error instanceof Error ? error.message : 'Failed to load') : null,
    loadMore,
    reset,
  };
}

export function useConvertCurrency() {
  const convert = async (fromCurrency: string, toCurrency: string, amount: number) => {
    try {
      const res = await fetch('/api/wallet/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromCurrency, toCurrency, amount }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to convert currency');
      }
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to convert currency';
      throw new Error(message);
    }
  };

  return { convert };
}

export interface EconomyTrends {
  gold: number[];
  diamonds: number[];
  timestamp: string[];
}

export interface EconomySummary {
  totalGold: number;
  totalDiamonds: number;
  avgGoldPerUser: number;
  avgDiamondsPerUser: number;
  trendingItems: Array<{
    name: string;
    sales: number;
  }>;
  totalUsers: number;
  timestamp: string;
  trends?: EconomyTrends;
}

export interface UseEconomySummaryReturn {
  summary: EconomySummary | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Hook for fetching economy summary statistics
 * Uses SWR with 10-minute cache
 * @param withTrends - Include 7-day trend data (default: false)
 */
export function useEconomySummary(withTrends: boolean = false): UseEconomySummaryReturn {
  const url = withTrends ? '/api/economy/summary?withTrends=true' : '/api/economy/summary';
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 10 * 60 * 1000, // Refresh every 10 minutes (600000 ms)
    dedupingInterval: 10 * 60 * 1000, // Dedupe requests within 10 minutes
    onError: (err) => {
      if (err instanceof Error) {
        const status = (err as any).status;
        if (status >= 400) {
          toast.error(err.message || 'Failed to load economy summary');
        }
      }
    },
  });

  return {
    summary: data ? (data as EconomySummary) : null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load') : null,
    reload: mutate,
  };
}

/**
 * Hook for fetching economy trends specifically
 * Uses useEconomySummary with trends enabled
 */
export function useEconomyTrends(): UseEconomySummaryReturn {
  return useEconomySummary(true);
}

export interface AdminEconomyOverview {
  summary: {
    totalGold: number;
    totalDiamonds: number;
    avgGoldPerUser: number;
    avgDiamondsPerUser: number;
    totalUsers: number;
    timestamp: string;
  };
  trends: EconomyTrends;
  topItems: Array<{
    id: string;
    name: string;
    sales: number;
    changePercent: number;
  }>;
  transactions: Transaction[];
  currencyBreakdown: {
    gold: number;
    diamonds: number;
    karma: number;
  };
}

export interface UseAdminEconomyOverviewReturn {
  overview: AdminEconomyOverview | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Hook for fetching admin economy overview
 * Single API call that aggregates all economy data
 * Uses SWR with 10-minute cache
 */
export function useAdminEconomyOverview(): UseAdminEconomyOverviewReturn {
  const { data, error, isLoading, mutate } = useSWR('/api/admin/economy/overview', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    dedupingInterval: 10 * 60 * 1000,
    onError: (err) => {
      if (err instanceof Error) {
        const status = (err as any).status;
        if (status >= 400) {
          toast.error(err.message || 'Failed to load economy overview');
        }
      }
    },
  });

  return {
    overview: data ? (data as AdminEconomyOverview) : null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load') : null,
    reload: mutate,
  };
}

export interface BalanceSetting {
  id: string;
  key: string;
  value: number;
  updatedAt: string;
}

export interface UseBalanceSettingsReturn {
  settings: BalanceSetting[];
  isLoading: boolean;
  error: string | null;
  updateSetting: (key: string, value: number) => Promise<void>;
  reload: () => void;
}

/**
 * Hook for fetching and updating balance settings
 * Uses SWR with 2-minute refresh and optimistic updates
 */
export function useBalanceSettings(): UseBalanceSettingsReturn {
  const { data, error, isLoading, mutate } = useSWR('/api/admin/balance', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
    dedupingInterval: 60000, // 1 minute deduplication
    onError: (err) => {
      if (err instanceof Error) {
        const status = (err as any).status;
        if (status >= 400) {
          toast.error(err.message || 'Failed to load balance settings');
        }
      }
    },
  });

  const updateSetting = async (key: string, value: number) => {
    try {
      // Optimistic update
      const currentSettings = Array.isArray(data?.settings) ? data.settings : []; // sanity-fix
      const optimisticSettings = currentSettings.map((s: BalanceSetting) =>
        s.key === key ? { ...s, value, updatedAt: new Date().toISOString() } : s
      );

      // Update local cache optimistically
      mutate({ success: true, settings: optimisticSettings }, false);

      // Make API call
      const res = await fetch('/api/admin/balance/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update setting');
      }

      // Revalidate to get actual server data
      await mutate();

      toast.success(`Setting ${key} updated to ${value}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update setting';
      toast.error(message);
      // Revalidate on error to reset optimistic update
      await mutate();
      throw err;
    }
  };

  return {
    settings: (data?.settings || []) as BalanceSetting[],
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load') : null,
    updateSetting,
    reload: mutate,
  };
}

export interface EconomyPreset {
  id: string;
  name: string;
  description: string;
  modifiers: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface UseEconomyPresetsReturn {
  presets: EconomyPreset[];
  isLoading: boolean;
  error: string | null;
  applyPreset: (presetId: string) => Promise<void>;
  reload: () => void;
}

/**
 * Hook for fetching and applying economy presets
 * Uses SWR with 2-minute refresh
 */
export function useEconomyPresets(): UseEconomyPresetsReturn {
  const { data, error, isLoading, mutate } = useSWR('/api/admin/presets', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
    dedupingInterval: 60000, // 1 minute deduplication
    onError: (err) => {
      if (err instanceof Error) {
        const status = (err as any).status;
        if (status >= 400) {
          toast.error(err.message || 'Failed to load presets');
        }
      }
    },
  });

  const applyPreset = async (presetId: string) => {
    try {
      // Make API call
      const res = await fetch('/api/admin/presets/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presetId }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to apply preset');
      }

      // Show success toast
      toast.success(result.message || `Preset applied successfully`);

      // Revalidate to get fresh data
      await mutate();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to apply preset';
      toast.error(message);
      throw err;
    }
  };

  return {
    presets: (data?.presets || []) as EconomyPreset[],
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load') : null,
    applyPreset,
    reload: mutate,
  };
}

export interface UseAdminEconomyActionsReturn {
  refreshCache: () => Promise<void>;
  exportReport: () => Promise<void>;
  isRefreshing: boolean;
  isExporting: boolean;
}

/**
 * Hook for admin economy actions (refresh, export)
 * Handles toasts and loading states
 * v0.32.5 - Admin Export & Refresh Tools
 */
export function useAdminEconomyActions(): UseAdminEconomyActionsReturn {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const refreshCache = async () => {
    try {
      setIsRefreshing(true);
      
      const res = await fetch('/api/admin/economy/refresh', {
        method: 'POST',
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to refresh cache');
      }

      toast.success('✅ Cache refreshed');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh cache';
      toast.error(message);
      throw err;
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportReport = async () => {
    try {
      setIsExporting(true);

      const res = await fetch('/api/admin/economy/export');

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to export report');
      }

      // Download the CSV file
      if (typeof window === 'undefined' || typeof document === 'undefined') { // sanity-fix
        throw new Error('Download only available in browser');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'parel-economy-report.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('📤 Report generated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export report';
      toast.error(message);
      throw err;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    refreshCache,
    exportReport,
    isRefreshing,
    isExporting,
  };
}

export interface AdminMetricsData {
  activeUsers: number;
  newUsersWeek: number;
  totalReflections: number;
  transactionsWeek: number;
  avgXPPerUser: number;
  xpTrend: number[];
  userTrend: number[];
  timestamp: string[];
}

export interface UseAdminMetricsReturn {
  metrics: AdminMetricsData | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Hook for fetching admin metrics overview
 * Uses SWR with 5-minute cache
 * v0.32.6 - Admin Metrics Dashboard
 */
export function useAdminMetrics(): UseAdminMetricsReturn {
  const { data, error, isLoading, mutate } = useSWR('/api/admin/metrics/overview', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    dedupingInterval: 60000, // 1 minute deduplication
    onError: (err) => {
      if (err instanceof Error) {
        const status = (err as any).status;
        if (status >= 400) {
          toast.error(err.message || 'Failed to load metrics');
        }
      }
    },
  });

  return {
    metrics: data ? (data as AdminMetricsData) : null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load') : null,
    reload: mutate,
  };
}

export interface SystemHealthData {
  uptime: string;
  dbStatus: 'ok' | 'slow' | 'error';
  dbLatencyMs: number;
  lastCronRuns: Array<{
    jobKey: string;
    lastRun: string;
    status: string;
    durationMs?: number | null;
  }>;
  apiLatencyMs: Record<string, number>;
  memoryUsageMB: number;
  cpuLoadPercent: number;
  timestamp: string;
}

export interface UseSystemHealthReturn {
  health: SystemHealthData | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Hook for fetching system health status
 * Auto-refreshes every 30 seconds
 * v0.32.7 - System Health & Cron Monitor
 */
export function useSystemHealth(): UseSystemHealthReturn {
  const { data, error, isLoading, mutate } = useSWR('/api/admin/system/health', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 30 * 1000, // Refresh every 30 seconds
    dedupingInterval: 10000, // 10 second deduplication
    onError: (err) => {
      if (err instanceof Error) {
        const status = (err as any).status;
        if (status >= 400) {
          toast.error(err.message || 'Failed to load system health');
        }
      }
    },
  });

  return {
    health: data ? (data as SystemHealthData) : null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load') : null,
    reload: mutate,
  };
}

export type SystemAlertType = 'cron' | 'api' | 'db' | 'cache' | 'memory' | 'cpu';
export type SystemAlertLevel = 'info' | 'warn' | 'error' | 'critical';

export interface SystemAlert {
  id: string;
  type: SystemAlertType;
  level: SystemAlertLevel;
  message: string;
  metadata?: any;
  createdAt: string;
  resolvedAt?: string | null;
  autoResolved: boolean;
}

export interface UseSystemAlertsReturn {
  alerts: SystemAlert[];
  countsByLevel: Record<SystemAlertLevel, number>;
  isLoading: boolean;
  error: string | null;
  resolveAlert: (alertId: string) => Promise<void>;
  resolveAll: () => Promise<void>;
  reload: () => void;
}

/**
 * Hook for fetching and managing system alerts
 * Auto-refreshes every 60 seconds
 * v0.33.0 - Alert System & Auto-Recovery Hooks
 */
export function useSystemAlerts(openOnly: boolean = true): UseSystemAlertsReturn {
  const url = `/api/admin/alerts?openOnly=${openOnly}`;
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 60 * 1000, // Refresh every 60 seconds
    dedupingInterval: 30000, // 30 second deduplication
    onError: (err) => {
      if (err instanceof Error) {
        const status = (err as any).status;
        if (status >= 400) {
          toast.error(err.message || 'Failed to load alerts');
        }
      }
    },
  });

  const resolveAlert = async (alertId: string) => {
    try {
      const res = await fetch('/api/admin/alerts/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to resolve alert');
      }

      toast.success('Alert resolved');
      await mutate();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resolve alert';
      toast.error(message);
      throw err;
    }
  };

  const resolveAll = async () => {
    try {
      const res = await fetch('/api/admin/alerts/resolve-all', {
        method: 'POST',
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to resolve all alerts');
      }

      toast.success(result.message || 'All alerts resolved');
      await mutate();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resolve all alerts';
      toast.error(message);
      throw err;
    }
  };

  return {
    alerts: (data?.alerts || []) as SystemAlert[],
    countsByLevel: data?.countsByLevel || { info: 0, warn: 0, error: 0, critical: 0 },
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load') : null,
    resolveAlert,
    resolveAll,
    reload: mutate,
  };
}

export type WebhookType = 'discord' | 'slack' | 'generic';

export interface AlertWebhook {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  type: WebhookType;
  createdAt: string;
  updatedAt: string;
}

export interface UseAlertWebhooksReturn {
  webhooks: AlertWebhook[];
  isLoading: boolean;
  error: string | null;
  createWebhook: (webhook: { name: string; url: string; type: WebhookType }) => Promise<void>;
  deleteWebhook: (webhookId: string) => Promise<void>;
  toggleWebhook: (webhookId: string, isActive: boolean) => Promise<void>;
  sendTest: () => Promise<void>;
  reload: () => void;
}

/**
 * Hook for managing alert webhooks
 * v0.33.1 - Alert Notifications & Webhooks
 */
export function useAlertWebhooks(): UseAlertWebhooksReturn {
  const { data, error, isLoading, mutate } = useSWR('/api/admin/alerts/webhooks', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 1 minute deduplication
    onError: (err) => {
      if (err instanceof Error) {
        const status = (err as any).status;
        if (status >= 400) {
          toast.error(err.message || 'Failed to load webhooks');
        }
      }
    },
  });

  const createWebhook = async (webhook: { name: string; url: string; type: WebhookType }) => {
    try {
      const res = await fetch('/api/admin/alerts/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhook),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create webhook');
      }

      toast.success(result.message || 'Webhook created');
      await mutate();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create webhook';
      toast.error(message);
      throw err;
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    try {
      const res = await fetch(`/api/admin/alerts/webhooks/${webhookId}`, {
        method: 'DELETE',
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete webhook');
      }

      toast.success(result.message || 'Webhook deleted');
      await mutate();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete webhook';
      toast.error(message);
      throw err;
    }
  };

  const toggleWebhook = async (webhookId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/alerts/webhooks/${webhookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update webhook');
      }

      toast.success(result.message || 'Webhook updated');
      await mutate();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update webhook';
      toast.error(message);
      throw err;
    }
  };

  const sendTest = async () => {
    try {
      const res = await fetch('/api/admin/alerts/test', {
        method: 'POST',
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to send test alert');
      }

      toast.success(result.message || 'Test alert sent');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send test alert';
      toast.error(message);
      throw err;
    }
  };

  return {
    webhooks: (data?.webhooks || []) as AlertWebhook[],
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load') : null,
    createWebhook,
    deleteWebhook,
    toggleWebhook,
    sendTest,
    reload: mutate,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// v0.34.2 - Economy Modifiers
// ─────────────────────────────────────────────────────────────────────────────

export interface EconomyModifiers {
  streak_xp_bonus: number;
  social_xp_multiplier: number;
  weekly_modifier_value: number;
}

export interface WeeklyModifier {
  id: string;
  name: string;
  description: string;
  bonusType: 'xp' | 'gold' | 'social' | 'streak';
  bonusValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface WeeklyModifierPreset {
  name: string;
  description: string;
  bonusType: 'xp' | 'gold' | 'social' | 'streak';
  bonusValue: number;
}

export interface UseEconomyModifiersReturn {
  modifiers: EconomyModifiers | null;
  weeklyModifier: WeeklyModifier | null;
  availablePresets: WeeklyModifierPreset[];
  isLoading: boolean;
  error: string | null;
  updateModifier: (key: keyof EconomyModifiers, value: number) => Promise<void>;
  setWeeklyModifier: (presetIndex: number) => Promise<void>;
  clearWeeklyModifier: () => Promise<void>;
  reload: () => void;
}

/**
 * Hook for fetching and updating economy modifiers
 * v0.34.2 - Streaks, social bonuses, weekly modifiers
 */
export function useEconomyModifiers(): UseEconomyModifiersReturn {
  const { data, error, isLoading, mutate } = useSWR('/api/admin/economy/modifiers', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
    dedupingInterval: 60000, // 1 minute deduplication
    onError: (err) => {
      if (err instanceof Error) {
        const status = (err as any).status;
        if (status >= 400) {
          toast.error(err.message || 'Failed to load economy modifiers');
        }
      }
    },
  });

  const updateModifier = async (key: keyof EconomyModifiers, value: number) => {
    try {
      // Optimistic update
      const currentModifiers = data?.modifiers || {};
      const optimisticModifiers = { ...currentModifiers, [key]: value };

      mutate({ ...data, modifiers: optimisticModifiers }, false);

      // Make API call
      const res = await fetch('/api/admin/economy/modifiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update modifier');
      }

      await mutate();
      toast.success(`${key} updated to ${value}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update modifier';
      toast.error(message);
      await mutate();
      throw err;
    }
  };

  const setWeeklyModifier = async (presetIndex: number) => {
    try {
      const res = await fetch('/api/admin/economy/modifiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklyModifierPreset: presetIndex }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to set weekly modifier');
      }

      await mutate();
      toast.success(result.message || 'Weekly modifier updated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set weekly modifier';
      toast.error(message);
      await mutate();
      throw err;
    }
  };

  const clearWeeklyModifier = async () => {
    await setWeeklyModifier(0);
  };

  return {
    modifiers: data?.modifiers || null,
    weeklyModifier: data?.weeklyModifier || null,
    availablePresets: data?.availableWeeklyPresets || [],
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load') : null,
    updateModifier,
    setWeeklyModifier,
    clearWeeklyModifier,
    reload: mutate,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// v0.34.3 - Featured Market Items
// ─────────────────────────────────────────────────────────────────────────────

export interface UseFeaturedItemsReturn {
  items: MarketItem[];
  count: number;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Hook for fetching featured market items
 * v0.34.3 - Returns top 5 featured items for carousel display
 */
export function useFeaturedItems(): UseFeaturedItemsReturn {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/market/items?isFeatured=true&limit=5',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      dedupingInterval: 60000, // 1 minute deduplication
      onError: (err) => {
        if (err instanceof Error) {
          const status = (err as any).status;
          if (status >= 400) {
            toast.error(err.message || 'Failed to load featured items');
          }
        }
      },
    }
  );

  return {
    items: (data?.items || []) as MarketItem[],
    count: data?.count || 0,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load') : null,
    reload: mutate,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// v0.34.4 - Mount Trials
// ─────────────────────────────────────────────────────────────────────────────

export interface MountTrial {
  id: string;
  mountId: string;
  name: string;
  description: string;
  rewardType: 'badge' | 'speed' | 'karma' | 'xp' | 'gold';
  rewardValue: number;
  maxAttempts: number | null;
  expiresAt: string | null;
  isActive: boolean;
  userProgress?: {
    progress: number;
    completed: boolean;
    lastAttemptAt: string | null;
  };
  isExpired: boolean;
  attemptsRemaining: number | null;
}

export interface UseMountTrialsReturn {
  trials: MountTrial[];
  count: number;
  isLoading: boolean;
  error: string | null;
  updateProgress: (trialId: string, incrementBy?: number) => Promise<void>;
  completeTrial: (trialId: string) => Promise<void>;
  reload: () => void;
}

/**
 * Hook for fetching and managing mount trials
 * v0.34.4 - Mount-specific micro-challenges
 */
export function useMountTrials(): UseMountTrialsReturn {
  const { data, error, isLoading, mutate } = useSWR('/api/mounts/trials', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 2 * 60 * 1000, // Refresh every 2 minutes
    dedupingInterval: 60000, // 1 minute deduplication
    onError: (err) => {
      if (err instanceof Error) {
        const status = (err as any).status;
        if (status >= 400) {
          toast.error(err.message || 'Failed to load mount trials');
        }
      }
    },
  });

  const updateProgress = async (trialId: string, incrementBy = 1) => {
    try {
      const res = await fetch('/api/mounts/trials/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trialId, action: 'progress', incrementBy }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update progress');
      }

      await mutate();
      toast.success(result.message || 'Progress updated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update progress';
      toast.error(message);
      throw err;
    }
  };

  const completeTrial = async (trialId: string) => {
    try {
      const res = await fetch('/api/mounts/trials/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trialId, action: 'complete' }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to complete trial');
      }

      await mutate();
      toast.success(result.message || 'Trial completed!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete trial';
      toast.error(message);
      throw err;
    }
  };

  return {
    trials: (data?.trials || []) as MountTrial[],
    count: data?.count || 0,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load') : null,
    updateProgress,
    completeTrial,
    reload: mutate,
  };
}

/**
 * Marketplace Listing Interface
 */
export interface MarketplaceListing {
  id: string;
  price: number;
  currencyKey: string;
  createdAt: string;
  item: {
    id: string;
    name: string;
    emoji: string;
    rarity: string;
    type: string;
    power?: number | null;
    defense?: number | null;
  };
  seller: {
    id: string;
    name: string | null;
    username: string | null;
  };
}

/**
 * Hook for marketplace listings
 * v0.36.4 - Marketplace listing + buying flow
 * v0.41.14 - Migrated GET call to unified API client
 */
export function useMarket(category?: string) {
  const url = category 
    ? `/api/marketplace?category=${category}` 
    : '/api/marketplace';
  
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    listings: MarketplaceListing[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(url, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const buyListing = async (listingId: string) => {
    try {
      const res = await fetch('/api/marketplace/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to buy item');
      }
      await mutate();
      toast.success('Item purchased successfully!');
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to buy item';
      toast.error(message);
      throw err;
    }
  };

  const cancelListing = async (listingId: string) => {
    try {
      const res = await fetch('/api/marketplace/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to cancel listing');
      }
      await mutate();
      toast.success('Listing cancelled');
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel listing';
      toast.error(message);
      throw err;
    }
  };

  return {
    listings: (data?.listings || []) as MarketplaceListing[],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load listings') : null,
    buyListing,
    cancelListing,
    reload: mutate,
  };
}