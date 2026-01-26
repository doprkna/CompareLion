/**
 * Notification Bell Component
 * Shows notification count and opens notification panel
 * v0.40.17 - Story Notifications 1.0
 */

'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/apiBase';
import NotificationPanel from './NotificationPanel';

interface Notification {
  id: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data: any;
}

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadNotifications() {
    try {
      const res = await apiFetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.unreadCount || 0);
        if (isOpen) {
          setNotifications(data.notifications || []);
        }
      }
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  }

  async function handleOpen() {
    setIsOpen(true);
    setLoading(true);
    try {
      const res = await apiFetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id: string) {
    try {
      await apiFetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  }

  async function handleMarkAllRead() {
    try {
      await apiFetch('/api/notifications/read-all', {
        method: 'POST',
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpen}
        className="relative"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
      {isOpen && (
        <NotificationPanel
          notifications={notifications}
          loading={loading}
          onClose={() => setIsOpen(false)}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
        />
      )}
    </>
  );
}

