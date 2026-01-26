/**
 * Admin Notifications Management Page
 * v0.36.26 - Notifications 2.0
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Filter, Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  refId: string | null;
  isRead: boolean;
  createdAt: Date;
  user: {
    id: string;
    username: string | null;
    name: string | null;
    email: string | null;
  };
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

export default function AdminNotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [sendUserId, setSendUserId] = useState<string>('');
  const [sendTitle, setSendTitle] = useState<string>('');
  const [sendBody, setSendBody] = useState<string>('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    loadNotifications();
  }, [status, filterType, filterUserId]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.set('type', filterType);
      if (filterUserId) params.set('userId', filterUserId);

      const res = await fetch(`/api/admin/notifications?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Failed to load notifications', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!sendUserId || !sendTitle) {
      toast.error('User ID and title are required');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: sendUserId,
          title: sendTitle,
          body: sendBody || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Notification sent successfully');
        setSendUserId('');
        setSendTitle('');
        setSendBody('');
        loadNotifications();
      } else {
        toast.error(data.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Failed to send notification', error);
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Notifications Management</h1>

      {/* Send Notification Form */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Send System Notification</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">User ID</label>
              <Input
                value={sendUserId}
                onChange={(e) => setSendUserId(e.target.value)}
                placeholder="User ID"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input
                value={sendTitle}
                onChange={(e) => setSendTitle(e.target.value)}
                placeholder="Notification title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Body (optional)</label>
              <Input
                value={sendBody}
                onChange={(e) => setSendBody(e.target.value)}
                placeholder="Notification body"
              />
            </div>
            <Button onClick={handleSendNotification} disabled={sending}>
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Notification
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-background"
              >
                <option value="">All Types</option>
                <option value="achievement">Achievement</option>
                <option value="fight">Fight</option>
                <option value="quest">Quest</option>
                <option value="levelup">Level Up</option>
                <option value="loot">Loot</option>
                <option value="system">System</option>
                <option value="social">Social</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Filter by User ID</label>
              <Input
                type="text"
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
                placeholder="User ID"
              />
            </div>
            <Button onClick={loadNotifications}>
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-2">
        {notifications.map((notification) => (
          <Card key={notification.id}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 text-2xl">
                  {TYPE_ICONS[notification.type] || '📬'}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{notification.title}</span>
                        <span className="text-xs px-2 py-1 bg-muted rounded">
                          {notification.type}
                        </span>
                        {!notification.isRead && (
                          <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                            Unread
                          </span>
                        )}
                      </div>
                      {notification.body && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {notification.body}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {notification.user.username || notification.user.name || 'Unknown'} ({notification.user.email})
                        </span>
                        <span>
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {notifications.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No notifications found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

