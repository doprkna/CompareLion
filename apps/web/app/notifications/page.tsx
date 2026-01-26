/**
 * Notifications Center Page
 * v0.36.26 - Notifications 2.0
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

type Notification = {
  id: string;
  type: 'achievement' | 'fight' | 'quest' | 'system' | 'loot' | 'levelup' | 'social';
  title: string;
  body: string | null;
  refId: string | null;
  isRead: boolean;
  createdAt: Date;
};

type NotificationsResponse = {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
  nextCursor: string | null;
  hasMore: boolean;
};

const TYPE_ICONS: Record<string, string> = {
  achievement: '🏆',
  fight: '⚔️',
  quest: '📘',
  levelup: '⭐',
  loot: '🎁',
  system: '🛠️',
  social: '💬',
};

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const loadNotifications = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set('limit', '20');
      if (cursor && !reset) {
        params.set('cursor', cursor);
      }

      const res = await fetch(`/api/notifications?${params.toString()}`);
      const data: NotificationsResponse = await res.json();

      if (data.success) {
        if (reset) {
          setNotifications(data.notifications);
        } else {
          setNotifications((prev) => [...prev, ...data.notifications]);
        }
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to load notifications', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [cursor, loading]);

  useEffect(() => {
    loadNotifications(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadNotifications();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadNotifications]);

  const handleMarkAllRead = async () => {
    setMarkingAllRead(true);
    try {
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark all as read', error);
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        const deleted = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (deleted && !deleted.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Failed to delete notification', error);
      toast.error('Failed to delete notification');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllRead}
            disabled={markingAllRead}
            variant="outline"
          >
            {markingAllRead ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCheck className="w-4 h-4 mr-2" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`cursor-pointer transition-colors ${
              !notification.isRead ? 'bg-muted/50 border-primary/20' : ''
            }`}
            onClick={() => {
              if (!notification.isRead) {
                handleMarkRead(notification.id);
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 text-2xl">
                  {TYPE_ICONS[notification.type] || '📬'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{notification.title}</h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      {notification.body && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {notification.body}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {!hasMore && notifications.length > 0 && (
          <div className="text-center text-muted-foreground py-8">
            No more notifications
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🦁</div>
              <h3 className="text-xl font-semibold mb-2">You're all caught up!</h3>
              <p className="text-muted-foreground">
                No notifications yet. Check back later!
              </p>
            </CardContent>
          </Card>
        )}

        <div ref={sentinelRef} className="h-4" />
      </div>
    </div>
  );
}

