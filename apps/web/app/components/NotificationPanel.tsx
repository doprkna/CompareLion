/**
 * Notification Panel Component
 * Displays list of notifications
 * v0.40.17 - Story Notifications 1.0
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Heart, Sparkles, Repeat, Trophy, Calendar, Check, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data: any;
}

interface NotificationPanelProps {
  notifications: Notification[];
  loading: boolean;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const NOTIFICATION_ICONS: Record<string, any> = {
  story_reaction: Heart,
  story_sticker: Sparkles,
  story_remix: Repeat,
  challenge_entry: Trophy,
  challenge_end: Trophy,
  weekly_story_ready: Calendar,
};

const NOTIFICATION_MESSAGES: Record<string, (data: any) => string> = {
  story_reaction: (data) => `Someone reacted to your story`,
  story_sticker: (data) => `🔥 New sticker on your story`,
  story_remix: (data) => `Your story got a remix`,
  challenge_entry: (data) => `Your story was submitted to a challenge`,
  challenge_end: (data) => `Challenge ended`,
  weekly_story_ready: (data) => `Weekly Story is ready`,
};

export default function NotificationPanel({
  notifications,
  loading,
  onClose,
  onMarkRead,
  onMarkAllRead,
}: NotificationPanelProps) {
  const router = useRouter();
  const [markingAll, setMarkingAll] = useState(false);

  function handleNotificationClick(notification: Notification) {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === 'story_reaction' || notification.type === 'story_sticker') {
      if (notification.data.storyId) {
        router.push(`/story/view/${notification.data.storyId}`);
        onClose();
      }
    } else if (notification.type === 'story_remix') {
      if (notification.data.remixId) {
        router.push(`/story/view/${notification.data.remixId}`);
        onClose();
      } else if (notification.data.storyId) {
        router.push(`/story/view/${notification.data.storyId}`);
        onClose();
      }
    } else if (notification.type === 'challenge_entry' || notification.type === 'challenge_end') {
      if (notification.data.challengeId) {
        router.push(`/story/challenges/${notification.data.challengeId}`);
        onClose();
      }
    } else if (notification.type === 'weekly_story_ready') {
      if (notification.data.storyId) {
        router.push(`/story/view/${notification.data.storyId}`);
        onClose();
      }
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      onMarkAllRead();
    } finally {
      setMarkingAll(false);
    }
  }

  // Group notifications by day
  const groupedNotifications = notifications.reduce((acc, notif) => {
    const date = new Date(notif.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let groupKey: string;
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else {
      groupKey = date.toLocaleDateString();
    }

    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(notif);
    return acc;
  }, {} as Record<string, Notification[]>);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md">
        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Notifications</CardTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  disabled={markingAll}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-subtle">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-subtle">No notifications</div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedNotifications).map(([groupKey, groupNotifs]) => (
                  <div key={groupKey}>
                    <h3 className="text-xs font-semibold text-subtle mb-2 uppercase">{groupKey}</h3>
                    <div className="space-y-2">
                      {groupNotifs.map((notif) => {
                        const Icon = NOTIFICATION_ICONS[notif.type] || Bell;
                        const message = NOTIFICATION_MESSAGES[notif.type]?.(notif.data) || 'New notification';

                        return (
                          <div
                            key={notif.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              notif.isRead
                                ? 'bg-card border-border'
                                : 'bg-blue-50 border-blue-200'
                            }`}
                            onClick={() => handleNotificationClick(notif)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${
                                notif.isRead ? 'bg-subtle/10' : 'bg-blue-100'
                              }`}>
                                <Icon className={`w-4 h-4 ${
                                  notif.isRead ? 'text-subtle' : 'text-blue-600'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${notif.isRead ? 'text-text' : 'text-text font-medium'}`}>
                                  {message}
                                </p>
                                <p className="text-xs text-subtle mt-1">
                                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                              {!notif.isRead && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

