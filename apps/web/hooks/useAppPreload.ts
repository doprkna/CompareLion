'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PreloadData {
  user?: any;
  ready: boolean;
}

export function useAppPreload() {
  const [preloadData, setPreloadData] = useState<PreloadData>({ ready: false });
  const [isPreloading, setIsPreloading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const preloadApp = useCallback(async () => {
    if (isPreloading) return;
    
    setIsPreloading(true);
    
    try {
      // Prefetch main route
      router.prefetch('/main');
      
      // Fetch init data if logged in
      if (status === 'authenticated' && session) {
        const response = await fetch('/api/init');
        if (response.ok) {
          const data = await response.json();
          setPreloadData({ user: data.user, ready: true });
        } else {
          setPreloadData({ ready: true });
        }
      } else {
        // Guest mode - just mark as ready
        setPreloadData({ ready: true });
      }
    } catch (error) {
      console.error('Preload error:', error);
      setPreloadData({ ready: true }); // Still mark as ready to not block UI
    } finally {
      setIsPreloading(false);
    }
  }, [isPreloading, status, session, router]);

  return {
    preloadData,
    preloadApp,
    isPreloading,
    isReady: preloadData.ready,
  };
}








