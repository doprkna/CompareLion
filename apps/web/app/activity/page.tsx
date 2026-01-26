'use client';

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/apiBase";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  MessageSquare, 
  Target, 
  Trophy, 
  TrendingUp, 
  ShoppingBag, 
  Flame, 
  LogIn,
  Activity as ActivityIcon
} from "lucide-react";
import { useEventBus } from '@parel/core/hooks/useEventBus';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string | null;
  metadata: any;
  createdAt: string;
}

const activityIcons: Record<string, any> = {
  xp: Sparkles,
  message: MessageSquare,
  flow: Target,
  achievement: Trophy,
  level_up: TrendingUp,
  purchase: ShoppingBag,
  streak: Flame,
  login: LogIn,
};

const activityColors: Record<string, string> = {
  xp: "text-accent",
  message: "text-blue-500",
  flow: "text-green-500",
  achievement: "text-yellow-500",
  level_up: "text-purple-500",
  purchase: "text-orange-500",
  streak: "text-red-500",
  login: "text-gray-500",
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch("/api/activity");
    if ((res as any).ok && (res as any).data?.activities) {
      setActivities((res as any).data.activities);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Listen for new activities
  useEventBus("activity:new", useCallback(() => {
    loadActivities(); // Refresh feed
  }, [loadActivities]));

  // Polling fallback (refresh every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      loadActivities();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadActivities]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text text-xl">Loading activity feed...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <ActivityIcon className="h-8 w-8 text-accent" />
          <div>
            <h1 className="text-3xl font-bold text-text">Activity Feed</h1>
            <p className="text-subtle">Your recent actions and achievements</p>
          </div>
        </div>

        {/* Activity Feed Card */}
        <Card className="bg-card border-2 border-border text-text shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center justify-between">
              <span>Recent Activity</span>
              <span className="text-sm text-subtle font-normal">
                {activities.length} {activities.length === 1 ? 'event' : 'events'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {activities.map((activity) => {
                  const Icon = activityIcons[activity.type] || ActivityIcon;
                  const colorClass = activityColors[activity.type] || "text-text";
                  
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 border-b border-border pb-4 last:border-b-0 hover:bg-bg/50 p-3 rounded-lg transition-colors"
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 ${colorClass}`}>
                        <Icon className="h-6 w-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-text">
                          {activity.title}
                        </div>
                        {activity.description && (
                          <div className="text-sm text-subtle mt-1">
                            {activity.description}
                          </div>
                        )}
                        <div className="text-xs text-muted mt-2">
                          {new Date(activity.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {/* Badge (if applicable) */}
                      {activity.type === "xp" && activity.metadata?.amount && (
                        <div className="flex-shrink-0 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-bold">
                          +{activity.metadata.amount} XP
                        </div>
                      )}
                      {activity.type === "level_up" && activity.metadata?.level && (
                        <div className="flex-shrink-0 bg-purple-500/10 text-purple-500 px-3 py-1 rounded-full text-sm font-bold">
                          Level {activity.metadata.level}
                        </div>
                      )}
                      {activity.type === "achievement" && (
                        <div className="flex-shrink-0 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-sm font-bold">
                          🏆
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <ActivityIcon className="h-16 w-16 text-subtle mx-auto mb-4 opacity-50" />
                <p className="text-subtle text-lg">No activity yet</p>
                <p className="text-subtle text-sm mt-2">
                  Start completing flows, sending messages, and earning achievements!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Type Legend */}
        <Card className="bg-card border border-border text-text shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Activity Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {Object.entries(activityIcons).map(([type, Icon]) => (
                <div key={type} className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${activityColors[type]}`} />
                  <span className="text-subtle capitalize">{type.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

