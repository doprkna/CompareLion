/**
 * Unified Ad Service
 * v0.36.22 - Ads Integration (Web + Android)
 *
 * Provides unified interface for banner and rewarded ads
 * Handles web fallbacks and Capacitor AdMob integration
 */
export interface AdReward {
    success: boolean;
    rewardType?: 'xp' | 'gold';
    amount?: number;
}
export interface AdService {
    showBanner(containerId: string): Promise<void>;
    hideBanner(containerId: string): Promise<void>;
    showRewardedAd(rewardType: 'xp' | 'gold'): Promise<AdReward>;
    isEnabledForRegion(region?: string | null): boolean;
    isDisabledForUser(isPremium: boolean): boolean;
}
declare class UnifiedAdService implements AdService {
    private bannerContainers;
    private isWeb;
    private isCapacitor;
    /**
     * Check if ads are enabled for a region
     */
    isEnabledForRegion(region?: string | null): boolean;
    /**
     * Check if ads should be disabled for a user (premium)
     */
    isDisabledForUser(isPremium: boolean): boolean;
    /**
     * Show banner ad
     */
    showBanner(containerId: string): Promise<void>;
    /**
     * Hide banner ad
     */
    hideBanner(containerId: string): Promise<void>;
    /**
     * Show rewarded ad
     */
    showRewardedAd(rewardType: 'xp' | 'gold'): Promise<AdReward>;
    /**
     * Capacitor AdMob - Show banner
     */
    private showCapacitorBanner;
    /**
     * Capacitor AdMob - Hide banner
     */
    private hideCapacitorBanner;
    /**
     * Capacitor AdMob - Show rewarded ad
     */
    private showCapacitorRewardedAd;
    /**
     * Web fallback - Show banner
     */
    private showWebBanner;
    /**
     * Web fallback - Hide banner
     */
    private hideWebBanner;
    /**
     * Web fallback - Show rewarded ad (MVP: modal with timer)
     */
    private showWebRewardedAd;
}
export declare const adService: UnifiedAdService;
export default adService;
