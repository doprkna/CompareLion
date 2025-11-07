/**
 * PWA utilities (v0.21.0)
 * Client-side helpers for Progressive Web App features
 */

import { logger } from '@/lib/logger';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    logger.debug('[PWA] Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    logger.info('[PWA] Service worker registered', { scope: registration.scope });

    // Check for updates every hour
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          logger.info('[PWA] New version available');
          // Notify user about update
          if (typeof window !== 'undefined' && (window as any).notifyUpdate) {
            (window as any).notifyUpdate();
          }
        }
      });
    });

    return registration;
  } catch (error) {
    logger.error('[PWA] Service worker registration failed', error);
    return null;
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      logger.info('[PWA] Service worker unregistered', { success });
      return success;
    }
    return false;
  } catch (error) {
    logger.error('[PWA] Service worker unregistration failed', error);
    return false;
  }
}

/**
 * Setup install prompt listener
 */
export function setupInstallPrompt(callback?: (event: BeforeInstallPromptEvent) => void) {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    logger.debug('[PWA] Install prompt available');
    
    if (callback) {
      callback(deferredPrompt);
    }
  });

  window.addEventListener('appinstalled', () => {
    logger.info('[PWA] App installed');
    deferredPrompt = null;
  });
}

/**
 * Show install prompt
 */
export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    logger.debug('[PWA] Install prompt not available');
    return false;
  }

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    logger.info('[PWA] Install prompt outcome', { outcome });
    
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (error) {
    logger.error('[PWA] Install prompt failed', error);
    return false;
  }
}

/**
 * Check if app is installed
 */
export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if running in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Check if running as PWA on iOS
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  return false;
}

/**
 * Check if running on mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if running on iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

/**
 * Get display mode
 */
export function getDisplayMode(): 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen' {
  if (typeof window === 'undefined') return 'browser';
  
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen';
  }
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui';
  }
  return 'browser';
}

/**
 * Cache URLs for offline access
 */
export async function cacheUrls(urls: string[]): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  registration.active?.postMessage({
    type: 'CACHE_URLS',
    urls,
  });
}

/**
 * Clear all caches
 */
export async function clearCaches(): Promise<void> {
  if (typeof window === 'undefined') return;

  if ('caches' in window) {
    const names = await caches.keys();
    await Promise.all(names.map(name => caches.delete(name)));
    logger.info('[PWA] All caches cleared');
  }

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({
      type: 'CLEAR_CACHE',
    });
  }
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Setup online/offline listeners
 */
export function setupOnlineListeners(
  onOnline?: () => void,
  onOffline?: () => void
) {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', () => {
    logger.debug('[PWA] Connection restored');
    onOnline?.();
  });

  window.addEventListener('offline', () => {
    logger.debug('[PWA] Connection lost');
    onOffline?.();
  });
}

