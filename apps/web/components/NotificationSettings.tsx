'use client';

/**
 * Notification Settings Component
 * Toggle and configure push notifications
 * v0.13.2m - Retention Features
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Bell, BellOff, TestTube, Clock, Flame } from 'lucide-react';
import { 
  isNotificationSupported,
  getNotificationPermission,
  toggleNotifications,
  getNotificationConfig,
  saveNotificationConfig,
  scheduleDailyReminder,
  cancelDailyReminder,
  sendTestNotification,
} from '@/lib/notifications';
import { toast } from 'sonner';

export function NotificationSettings() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [enabled, setEnabled] = useState(false);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [streakReminder, setStreakReminder] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSupported(isNotificationSupported());
    setPermission(getNotificationPermission());

    const config = getNotificationConfig();
    setEnabled(config.enabled);
    setDailyReminder(config.dailyReminder);
    setReminderTime(config.reminderTime);
    setStreakReminder(config.streakReminder);
  }, []);

  const handleToggleNotifications = async (value: boolean) => {
    const success = await toggleNotifications(value);
    
    if (success) {
      setEnabled(value);
      setPermission(getNotificationPermission());
      toast.success(value ? 'Notifications enabled' : 'Notifications disabled');
    } else {
      toast.error('Failed to enable notifications. Please check browser permissions.');
    }
  };

  const handleToggleDailyReminder = (value: boolean) => {
    setDailyReminder(value);
    
    const config = getNotificationConfig();
    config.dailyReminder = value;
    saveNotificationConfig(config);

    if (value) {
      scheduleDailyReminder(reminderTime);
      toast.success(`Daily reminder set for ${reminderTime}`);
    } else {
      cancelDailyReminder();
      toast.success('Daily reminder cancelled');
    }
  };

  const handleTimeChange = (newTime: string) => {
    setReminderTime(newTime);
    
    if (dailyReminder) {
      scheduleDailyReminder(newTime);
      toast.success(`Reminder time updated to ${newTime}`);
    }
  };

  const handleToggleStreakReminder = (value: boolean) => {
    setStreakReminder(value);
    
    const config = getNotificationConfig();
    config.streakReminder = value;
    saveNotificationConfig(config);

    toast.success(value ? 'Streak reminders enabled' : 'Streak reminders disabled');
  };

  const handleTestNotification = async () => {
    const success = await sendTestNotification();
    
    if (success) {
      toast.success('Test notification sent!');
    } else {
      toast.error('Failed to send test notification');
    }
  };

  if (!mounted) {
    return null;
  }

  if (!supported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Get reminders to stay on track with your learning goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enable-notifications" className="text-base font-medium">
              Enable Notifications
            </Label>
            <p className="text-sm text-text-secondary">
              {permission === 'granted' 
                ? 'Notifications are allowed'
                : permission === 'denied'
                ? 'Notifications are blocked (check browser settings)'
                : 'Permission not yet requested'}
            </p>
          </div>
          <Switch
            id="enable-notifications"
            checked={enabled}
            onCheckedChange={handleToggleNotifications}
            disabled={permission === 'denied'}
          />
        </div>

        {enabled && permission === 'granted' && (
          <>
            <div className="h-px bg-border" />

            {/* Daily Reminder */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-reminder" className="text-base font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Daily Reminder
                  </Label>
                  <p className="text-sm text-text-secondary">
                    Get notified at a specific time each day
                  </p>
                </div>
                <Switch
                  id="daily-reminder"
                  checked={dailyReminder}
                  onCheckedChange={handleToggleDailyReminder}
                />
              </div>

              {dailyReminder && (
                <div className="pl-6 space-y-2">
                  <Label htmlFor="reminder-time" className="text-sm">
                    Reminder Time
                  </Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-40"
                  />
                </div>
              )}
            </div>

            <div className="h-px bg-border" />

            {/* Streak Reminder */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="streak-reminder" className="text-base font-medium flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Streak Reminders
                </Label>
                <p className="text-sm text-text-secondary">
                  Get notified when your streak is at risk
                </p>
              </div>
              <Switch
                id="streak-reminder"
                checked={streakReminder}
                onCheckedChange={handleToggleStreakReminder}
              />
            </div>

            <div className="h-px bg-border" />

            {/* Test Notification */}
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                className="flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                Send Test Notification
              </Button>
              <p className="text-xs text-text-secondary mt-2">
                Make sure notifications are working properly
              </p>
            </div>
          </>
        )}

        {permission === 'denied' && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Notifications Blocked:</strong> Please enable notifications in your browser settings to use this feature.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

