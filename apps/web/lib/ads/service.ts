/**
 * Unified Ad Service
 * v0.36.22 - Ads Integration (Web + Android)
 * 
 * Provides unified interface for banner and rewarded ads
 * Handles web fallbacks and Capacitor AdMob integration
 */

import { isAdsEnabledForRegion } from '@/config/regionAds';
import { logger } from '@/lib/logger';

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

class UnifiedAdService implements AdService {
  private bannerContainers: Set<string> = new Set();
  private isWeb = typeof window !== 'undefined';
  private isCapacitor = this.isWeb && (window as any).Capacitor !== undefined;

  /**
   * Check if ads are enabled for a region
   */
  isEnabledForRegion(region?: string | null): boolean {
    return isAdsEnabledForRegion(region);
  }

  /**
   * Check if ads should be disabled for a user (premium)
   */
  isDisabledForUser(isPremium: boolean): boolean {
    return isPremium;
  }

  /**
   * Show banner ad
   */
  async showBanner(containerId: string): Promise<void> {
    if (this.bannerContainers.has(containerId)) {
      return; // Already showing
    }

    try {
      if (this.isCapacitor) {
        // Use Capacitor AdMob
        await this.showCapacitorBanner(containerId);
      } else {
        // Use web fallback
        await this.showWebBanner(containerId);
      }

      this.bannerContainers.add(containerId);
    } catch (error) {
      logger.warn('[AdService] Failed to show banner', { containerId, error });
    }
  }

  /**
   * Hide banner ad
   */
  async hideBanner(containerId: string): Promise<void> {
    try {
      if (this.isCapacitor) {
        await this.hideCapacitorBanner(containerId);
      } else {
        await this.hideWebBanner(containerId);
      }

      this.bannerContainers.delete(containerId);
    } catch (error) {
      logger.warn('[AdService] Failed to hide banner', { containerId, error });
    }
  }

  /**
   * Show rewarded ad
   */
  async showRewardedAd(rewardType: 'xp' | 'gold'): Promise<AdReward> {
    try {
      if (this.isCapacitor) {
        return await this.showCapacitorRewardedAd(rewardType);
      } else {
        return await this.showWebRewardedAd(rewardType);
      }
    } catch (error) {
      logger.warn('[AdService] Failed to show rewarded ad', { rewardType, error });
      return { success: false };
    }
  }

  /**
   * Capacitor AdMob - Show banner
   */
  private async showCapacitorBanner(containerId: string): Promise<void> {
    if (!this.isCapacitor) return;

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      const bannerId = process.env.NEXT_PUBLIC_ADMOB_ANDROID_BANNER_ID || '';

      if (!bannerId) {
        logger.warn('[AdService] AdMob banner ID not configured');
        return;
      }

      await AdMob.showBanner({
        adId: bannerId,
        adSize: 'BANNER',
        position: 'BOTTOM_CENTER',
      });
    } catch (error) {
      logger.error('[AdService] Capacitor banner error', error);
      throw error;
    }
  }

  /**
   * Capacitor AdMob - Hide banner
   */
  private async hideCapacitorBanner(containerId: string): Promise<void> {
    if (!this.isCapacitor) return;

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.hideBanner();
    } catch (error) {
      logger.error('[AdService] Capacitor hide banner error', error);
    }
  }

  /**
   * Capacitor AdMob - Show rewarded ad
   */
  private async showCapacitorRewardedAd(rewardType: 'xp' | 'gold'): Promise<AdReward> {
    if (!this.isCapacitor) {
      return { success: false };
    }

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      const rewardedId = process.env.NEXT_PUBLIC_ADMOB_ANDROID_REWARDED_ID || '';

      if (!rewardedId) {
        logger.warn('[AdService] AdMob rewarded ID not configured');
        return { success: false };
      }

      const result = await AdMob.prepareRewardVideoAd({
        adId: rewardedId,
      });

      if (result.value) {
        return {
          success: true,
          rewardType,
          amount: rewardType === 'xp' ? 20 : 10,
        };
      }

      return { success: false };
    } catch (error) {
      logger.error('[AdService] Capacitor rewarded ad error', error);
      return { success: false };
    }
  }

  /**
   * Web fallback - Show banner
   */
  private async showWebBanner(containerId: string): Promise<void> {
    if (!this.isWeb) return;

    const container = document.getElementById(containerId);
    if (!container) {
      logger.warn('[AdService] Banner container not found', { containerId });
      return;
    }

    // Load Google Auto Ads script (client-side only)
    if (!(window as any).adsbygoogle) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-PLACEHOLDER';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-ad-client', 'ca-pub-PLACEHOLDER');
      document.head.appendChild(script);
    }

    // Create ad placeholder
    const adDiv = document.createElement('div');
    adDiv.className = 'adsbygoogle';
    adDiv.setAttribute('data-ad-client', 'ca-pub-PLACEHOLDER');
    adDiv.setAttribute('data-ad-slot', 'PLACEHOLDER');
    adDiv.setAttribute('data-ad-format', 'auto');
    adDiv.setAttribute('data-full-width-responsive', 'true');
    adDiv.style.display = 'block';
    adDiv.style.minHeight = '100px';
    adDiv.style.width = '100%';

    container.appendChild(adDiv);

    // Initialize ad (after script loads)
    setTimeout(() => {
      try {
        if ((window as any).adsbygoogle) {
          ((window as any).adsbygoogle as any[]).push({});
        }
      } catch (error) {
        logger.warn('[AdService] Failed to push ad', error);
      }
    }, 1000);
  }

  /**
   * Web fallback - Hide banner
   */
  private async hideWebBanner(containerId: string): Promise<void> {
    if (!this.isWeb) return;

    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }
  }

  /**
   * Web fallback - Show rewarded ad (MVP: modal with timer)
   */
  private async showWebRewardedAd(rewardType: 'xp' | 'gold'): Promise<AdReward> {
    // MVP: Return success immediately (will be replaced with real ad SDK)
    // In production, this would show a modal with a timer
    return new Promise((resolve) => {
      // Simulate ad watching (5 seconds)
      setTimeout(() => {
        resolve({
          success: true,
          rewardType,
          amount: rewardType === 'xp' ? 20 : 10,
        });
      }, 5000);
    });
  }
}

// Export singleton instance
export const adService = new UnifiedAdService();

// Export default
export default adService;


