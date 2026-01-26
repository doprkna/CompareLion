'use client';
import { useState, useCallback } from 'react';
// sanity-fix: replaced next-auth/react import with local stub (web-only dependency)
const useSession = () => ({ data: null, status: 'unauthenticated' });
// sanity-fix: replaced next/navigation import with local stub (web-only dependency)
const useRouter = () => ({ push: () => { }, replace: () => { }, refresh: () => { } });
import { logger } from '../utils/debug'; // sanity-fix: replaced @parel/core self-import with relative import
export function useAppPreload() {
    const [preloadData, setPreloadData] = useState({ ready: false });
    const [isPreloading, setIsPreloading] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();
    const preloadApp = useCallback(async () => {
        if (isPreloading)
            return;
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
                }
                else {
                    setPreloadData({ ready: true });
                }
            }
            else {
                // Guest mode - just mark as ready
                setPreloadData({ ready: true });
            }
        }
        catch (error) {
            logger.error('Preload error', error);
            setPreloadData({ ready: true }); // Still mark as ready to not block UI
        }
        finally {
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
