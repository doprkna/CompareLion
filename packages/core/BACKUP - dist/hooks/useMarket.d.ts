export interface MarketItem {
    id: string;
    name: string;
    description: string;
    price: number;
    currencyKey: string;
    rarity?: string | null;
    category: 'item' | 'cosmetic' | 'booster' | 'utility' | 'social';
    tag?: 'featured' | 'limited' | 'weekly' | null;
    isFeatured?: boolean;
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
export interface MarketFilterParams {
    rarity?: string;
    category?: string;
    tag?: string;
    isFeatured?: boolean;
    sort?: string;
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
export interface UseInfiniteScrollOptions {
    threshold?: number;
    debounceMs?: number;
    enabled?: boolean;
}
export declare function useMarketItems(filterParams?: MarketFilterParams, infiniteScrollOptions?: UseInfiniteScrollOptions): UseMarketItemsReturn & {
    setScrollContainer: (element: HTMLElement | null) => void;
};
export declare function useWallet(): {
    wallets: WalletBalance[];
    loading: boolean;
    error: any;
    reload: () => void;
};
export declare function usePurchaseItem(): {
    purchase: (itemId: string) => Promise<any>;
};
export declare function useMarketTransactions(limit?: number): {
    transactions: Transaction[];
    loading: boolean;
    error: any;
    reload: () => void;
};
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
export declare function useTransactions(pageSize?: number): UseTransactionsReturn;
export declare function useConvertCurrency(): {
    convert: (fromCurrency: string, toCurrency: string, amount: number) => Promise<any>;
};
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
export declare function useEconomySummary(withTrends?: boolean): UseEconomySummaryReturn;
/**
 * Hook for fetching economy trends specifically
 * Uses useEconomySummary with trends enabled
 */
export declare function useEconomyTrends(): UseEconomySummaryReturn;
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
export declare function useAdminEconomyOverview(): UseAdminEconomyOverviewReturn;
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
export declare function useBalanceSettings(): UseBalanceSettingsReturn;
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
export declare function useEconomyPresets(): UseEconomyPresetsReturn;
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
export declare function useAdminEconomyActions(): UseAdminEconomyActionsReturn;
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
export declare function useAdminMetrics(): UseAdminMetricsReturn;
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
export declare function useSystemHealth(): UseSystemHealthReturn;
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
export declare function useSystemAlerts(openOnly?: boolean): UseSystemAlertsReturn;
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
    createWebhook: (webhook: {
        name: string;
        url: string;
        type: WebhookType;
    }) => Promise<void>;
    deleteWebhook: (webhookId: string) => Promise<void>;
    toggleWebhook: (webhookId: string, isActive: boolean) => Promise<void>;
    sendTest: () => Promise<void>;
    reload: () => void;
}
/**
 * Hook for managing alert webhooks
 * v0.33.1 - Alert Notifications & Webhooks
 */
export declare function useAlertWebhooks(): UseAlertWebhooksReturn;
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
export declare function useEconomyModifiers(): UseEconomyModifiersReturn;
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
export declare function useFeaturedItems(): UseFeaturedItemsReturn;
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
export declare function useMountTrials(): UseMountTrialsReturn;
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
export declare function useMarket(category?: string): {
    listings: MarketplaceListing[];
    loading: boolean;
    error: any;
    buyListing: (listingId: string) => Promise<any>;
    cancelListing: (listingId: string) => Promise<any>;
    reload: () => void;
};
