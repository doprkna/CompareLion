'use client';
// sanity-fix
/**
 * Notification Toast Hook
 * Shows toasts for new notifications
 * v0.36.26 - Notifications 2.0
 * v0.41.13 - Migrated to unified API client
 */
'use client';
import { useEffect, useRef } from 'react';
import { defaultClient } from '@parel/api'; // sanity-fix
import { toast } from 'sonner';
import { getUiConfig } from '@parel/core/config';
const TYPE_ICONS = {
    achievement: '🏆',
    fight: '⚔️',
    quest: '📘',
    levelup: '⭐',
    loot: '🎁',
    system: '🛠️',
    social: '💬',
};
/**
 * Show a notification toast
 */
export function showNotificationToast(type, title, body) {
    const icon = TYPE_ICONS[type] || '📬';
    const message = body ? `${title}\n${body}` : title;
    const uiConfig = getUiConfig();
    toast.info(message, {
        icon: icon,
        duration: uiConfig.toast.notificationDuration,
    });
}
/**
 * Hook to poll for new notifications and show toasts
 * Call this in a component that should show notification toasts
 */
export function useNotificationToasts(enabled = true) {
    const lastNotificationIdRef = useRef(null);
    const pollingIntervalRef = useRef(null);
    useEffect(() => {
        if (!enabled)
            return;
        // Poll for new notifications every 30 seconds
        const pollNotifications = async () => {
            try {
                const response = await defaultClient.get('/notifications?limit=1');
                if (response?.data?.notifications && Array.isArray(response.data.notifications) && response.data.notifications.length > 0) { // sanity-fix
                    const latest = response.data.notifications[0];
                    if (!latest || typeof latest !== 'object')
                        return; // sanity-fix
                    // Check if this is a new notification
                    // Note: NotificationDTO uses 'read' not 'isRead'
                    if (!latest.read &&
                        latest.id !== lastNotificationIdRef.current) {
                        showNotificationToast(latest.type, latest.title, latest.message);
                        lastNotificationIdRef.current = latest.id;
                    }
                }
            }
            catch (error) {
                // Silently fail - don't spam errors
                console.debug('[useNotificationToasts] Poll failed', error);
            }
        };
        // Initial poll
        pollNotifications();
        // Set up polling interval
        const uiConfig = getUiConfig();
        pollingIntervalRef.current = setInterval(pollNotifications, uiConfig.timing.polling.notifications);
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [enabled]);
}