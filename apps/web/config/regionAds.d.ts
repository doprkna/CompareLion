/**
 * Region-based Ad Configuration
 * v0.36.22 - Ads Integration
 *
 * GDPR-safe: EU regions disabled by default
 */
export interface RegionAdConfig {
    enabled: boolean;
    banner: boolean;
    rewarded: boolean;
    interstitial: boolean;
}
export declare const REGION_ADS: Record<string, RegionAdConfig>;
/**
 * Get ad configuration for a region
 */
export declare function getRegionAdConfig(region?: string | null): RegionAdConfig;
/**
 * Check if ads are enabled for a region
 */
export declare function isAdsEnabledForRegion(region?: string | null): boolean;
