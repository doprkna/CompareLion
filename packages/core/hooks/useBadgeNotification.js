'use client';
// sanity-fix
'use client';
import { useEffect, useState } from 'react';
import { useRealtime } from './useRealtime';
export function useBadgeNotification(onUnlock) {
    const { subscribe, unsubscribe } = useRealtime();
    const [pendingUnlock, setPendingUnlock] = useState(null);
    useEffect(() => {
        const handleBadgeUnlock = (event) => {
            setPendingUnlock(event);
            if (onUnlock) {
                onUnlock(event);
            }
        };
        subscribe('badge:unlock', handleBadgeUnlock);
        return () => {
            unsubscribe('badge:unlock', handleBadgeUnlock);
        };
    }, [subscribe, unsubscribe, onUnlock]);
    const clearPending = () => {
        setPendingUnlock(null);
    };
    return { pendingUnlock, clearPending };
}