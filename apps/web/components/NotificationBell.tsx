/**
 * NotificationBell Component
 * 
 * Shows notification count badge and allows marking as read.
 * Updates in real-time via event bus.
 */

'use client';

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/apiBase";
import { useEventBus } from "@/hooks/useEventBus";
import { useToast } from "@/components/ui/use-toast";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const loadNotifications = useCallback(async () => {
    const res = await apiFetch("/api/notifications");
    if ((res as any).ok && (res as any).data) {
      setItems((res as any).data.items || []);
      setUnread((res as any).data.unreadCount || 0);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Listen for new notifications
  useEventBus("notification:new", useCallback((notification: any) => {
    // Add to list
    setItems((prev) => [notification, ...prev]);
    setUnread((count) => count + 1);

    // Show toast
    toast({
      title: notification.title,
      description: notification.body || undefined,
    });
  }, [toast]));

  async function markAllRead() {
    const unreadIds = items.filter(item => !item.isRead).map(item => item.id);
    
    if (unreadIds.length === 0) {
      return;
    }

    const res = await apiFetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: unreadIds }),
    });

    if ((res as any).ok) {
      setItems(prev => prev.map(item => ({ ...item, isRead: true })));
      setUnread(0);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 hover:bg-card/50 rounded-full transition-colors">
          <Bell className="h-5 w-5 text-text" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 bg-card border-border text-text p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold text-lg">Notifications</h3>
          {unread > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={markAllRead}
              className="text-accent hover:text-accent/80"
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-[400px] overflow-y-auto">
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className={`p-4 border-b border-border last:border-b-0 hover:bg-bg/50 transition-colors ${
                  !item.isRead ? "bg-accent/5" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-text flex items-center gap-2">
                      {item.title}
                      {!item.isRead && (
                        <span className="h-2 w-2 bg-accent rounded-full" />
                      )}
                    </div>
                    {item.body && (
                      <div className="text-sm text-subtle mt-1">{item.body}</div>
                    )}
                    <div className="text-xs text-muted mt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-subtle">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No notifications yet</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}













