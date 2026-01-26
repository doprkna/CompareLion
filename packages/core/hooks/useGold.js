'use client';
// sanity-fix
/**
 * useGold Hook
 * Manages user gold balance with real-time updates
 * v0.26.2 - Economy Feedback & Shop Loop
 */
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
export function useGold() {
    const { data: session } = useSession();
    const [gold, setGold] = useState(0);
    const [loading, setLoading] = useState(true);
    const refreshGold = async () => {
        if (!session?.user?.email) {
            setGold(0);
            setLoading(false);
            return;
        }
        try {
            const res = await fetch('/api/user/gold');
            const data = await res.json();
            if (data.success) {
                setGold(data.gold || 0);
            }
        }
        catch (error) {
            console.error('[useGold] Error fetching gold:', error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        refreshGold();
    }, [session]);
    return {
        gold,
        loading,
        refreshGold,
    };
}