/**
 * useBadges Hook
 * v0.41.19 - Migrated to unified state store
 */
import type { Badge } from '../state/stores/badgesStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
export type { Badge };
export declare function useBadges(): {
    badges: any;
    loading: any;
    error: any;
    reload: (unlocked?: boolean) => any;
};
export declare function useUserBadges(): {
    badges: any;
    loading: any;
    error: any;
    reload: any;
    claimedCount: any;
    unclaimedCount: any;
};
