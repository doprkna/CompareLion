import type { Badge } from '../state/stores/badgesStore';
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
