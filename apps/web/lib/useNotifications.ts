/**
 * Notifications Hook
 * v0.19.6 - Real-time notification management with toast integration
 */

import { useState, useEffect, useCallback } from 'react';
import { showToast } from './toast';
import { logger } from '@/lib/logger';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
  senderId: string | null;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (ids: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        const newNotifications = data.items || [];
        
        // Check for new notifications since last fetch
        if (lastFetchTime > 0) {
          const newItems = newNotifications.filter(
            (notif: Notification) =>
              new Date(notif.createdAt).getTime() > lastFetchTime && !notif.isRead
          );

          // Show toast for new notifications
          newItems.forEach((notif: Notification) => {
            const icon = getNotificationIcon(notif.type);
            showToast(`${icon} ${notif.title}`, 'info');
          });
        }

        setNotifications(newNotifications);
        setUnreadCount(data.unreadCount || 0);
        setLastFetchTime(Date.now());
      } else {
        setError('Failed to load notifications');
      }
    } catch (err) {
      logger.error('Failed to fetch notifications', err);
      setError('Error loading notifications');
    } finally {
      setLoading(false);
    }
  }, [lastFetchTime]);

  const markAsRead = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;

    try {
      const response = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            ids.includes(notif.id) ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - ids.length));
      }
    } catch (err) {
      logger.error('Failed to mark notifications as read', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ all: true }),
      });

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
        showToast('All notifications marked as read', 'success');
      }
    } catch (err) {
      logger.error('Failed to mark all notifications as read', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}

function getNotificationIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'reflection':
      return '📝';
    case 'like':
      return '❤️';
    case 'comment':
      return '💬';
    case 'system':
    default:
      return '🔔';
  }
}

