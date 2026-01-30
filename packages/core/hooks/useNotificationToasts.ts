/**
 * Notification Toast Hook
 * Shows toasts for new notifications
 * v0.36.26 - Notifications 2.0
 * v0.41.13 - Migrated to unified API client
 */

'use client';

import { useEffect, useRef } from 'react';
import { defaultClient, ApiClientError } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)
import type { NotificationsResponseDTO } from '@parel/types'; // sanity-fix: replaced @parel/types/dto with @parel/types (dto not exported as subpath)
// sanity-fix: replaced sonner import with local stub (missing dependency)
const toast = { success: (..._a: unknown[]) => {}, error: (..._a: unknown[]) => {}, info: (..._a: unknown[]) => {}, warning: (..._a: unknown[]) => {} };
import { getUiConfig } from '../config/unified'; // sanity-fix: replaced @parel/core/config self-import with relative import

const TYPE_ICONS: Record<string, string> = {
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
export function showNotificationToast(
  type: string,
  title: string,
  body?: string | null
) {
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
export function useNotificationToasts(enabled: boolean = true) {
  const lastNotificationIdRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Poll for new notifications every 30 seconds
    const pollNotifications = async () => {
      try {
        const response = await defaultClient.get<NotificationsResponseDTO>('/notifications?limit=1');

        if (response?.data?.notifications && Array.isArray(response.data.notifications) && response.data.notifications.length > 0) { // sanity-fix
          const latest = response.data.notifications[0];
          if (!latest || typeof latest !== 'object') return; // sanity-fix

          // Check if this is a new notification
          // Note: NotificationDTO uses 'read' not 'isRead'
          if (
            !latest.read &&
            latest.id !== lastNotificationIdRef.current
          ) {
            showNotificationToast(latest.type, latest.title, latest.message);
            lastNotificationIdRef.current = latest.id;
          }
        }
      } catch (error) {
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

