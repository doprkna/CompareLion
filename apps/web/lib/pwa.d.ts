/**
 * PWA utilities (v0.21.0)
 * Client-side helpers for Progressive Web App features
 */
export interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
    }>;
}
/**
 * Register service worker
 */
export declare function registerServiceWorker(): Promise<ServiceWorkerRegistration | null>;
/**
 * Unregister service worker
 */
export declare function unregisterServiceWorker(): Promise<boolean>;
/**
 * Setup install prompt listener
 */
export declare function setupInstallPrompt(callback?: (event: BeforeInstallPromptEvent) => void): void;
/**
 * Show install prompt
 */
export declare function showInstallPrompt(): Promise<boolean>;
/**
 * Check if app is installed
 */
export declare function isAppInstalled(): boolean;
/**
 * Check if running on mobile
 */
export declare function isMobile(): boolean;
/**
 * Check if running on iOS
 */
export declare function isIOS(): boolean;
/**
 * Get display mode
 */
export declare function getDisplayMode(): 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen';
/**
 * Cache URLs for offline access
 */
export declare function cacheUrls(urls: string[]): Promise<void>;
/**
 * Clear all caches
 */
export declare function clearCaches(): Promise<void>;
/**
 * Check if online
 */
export declare function isOnline(): boolean;
/**
 * Setup online/offline listeners
 */
export declare function setupOnlineListeners(onOnline?: () => void, onOffline?: () => void): void;
