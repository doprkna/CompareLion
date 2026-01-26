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

export const REGION_ADS: Record<string, RegionAdConfig> = {
  EU: {
    enabled: false,
    banner: false,
    rewarded: false,
    interstitial: false,
  },
  US: {
    enabled: true,
    banner: true,
    rewarded: true,
    interstitial: true,
  },
  ASIA: {
    enabled: true,
    banner: true,
    rewarded: true,
    interstitial: false, // Less intrusive in Asia
  },
  DEFAULT: {
    enabled: true,
    banner: true,
    rewarded: true,
    interstitial: true,
  },
};

/**
 * Get ad configuration for a region
 */
export function getRegionAdConfig(region?: string | null): RegionAdConfig {
  if (!region) {
    return REGION_ADS.DEFAULT;
  }

  // Check for EU countries
  const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
  if (euCountries.includes(region.toUpperCase())) {
    return REGION_ADS.EU;
  }

  // Check for US
  if (region.toUpperCase() === 'US') {
    return REGION_ADS.US;
  }

  // Check for Asia regions
  const asiaRegions = ['CN', 'JP', 'KR', 'IN', 'SG', 'MY', 'TH', 'VN', 'PH', 'ID'];
  if (asiaRegions.includes(region.toUpperCase())) {
    return REGION_ADS.ASIA;
  }

  return REGION_ADS.DEFAULT;
}

/**
 * Check if ads are enabled for a region
 */
export function isAdsEnabledForRegion(region?: string | null): boolean {
  return getRegionAdConfig(region).enabled;
}


