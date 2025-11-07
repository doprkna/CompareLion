'use client';

import { useEffect, useState } from 'react';
import { registerServiceWorker, setupOnlineListeners, isOnline } from '@/lib/pwa';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // Register service worker
    registerServiceWorker().then((registration) => {
      if (registration) {
        logger.debug('[PWA] Service worker ready');
      }
    });

    // Setup online/offline listeners
    setupOnlineListeners(
      () => {
        setOnline(true);
        toast.success('Connection restored');
      },
      () => {
        setOnline(false);
        toast.error('You are offline', {
          description: 'Some features may be limited',
        });
      }
    );

    // Set initial online state
    setOnline(isOnline());

    // Setup update notification
    (window as any).notifyUpdate = () => {
      toast.info('New version available', {
        description: 'Refresh to update',
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload(),
        },
      });
    };
  }, []);

  return (
    <>
      {children}
      {!online && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 text-sm font-medium z-50">
          ⚠️ You are offline - Some features may be limited
        </div>
      )}
    </>
  );
}

