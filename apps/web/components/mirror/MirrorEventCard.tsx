'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Gift, Users } from 'lucide-react';

interface MirrorEventCardProps {
  event: {
    id: string;
    key: string;
    title: string;
    description: string;
    theme?: string;
    startDate: string;
    endDate: string;
    questionSet: string[];
    rewardXP: number;
    rewardBadgeId?: string;
    timeRemaining: number;
    daysRemaining: number;
    globalMood: string;
  };
}

export function MirrorEventCard({ event }: MirrorEventCardProps) {
  const formatTimeRemaining = (ms: number) => {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const moodEmojis: Record<string, string> = {
    joy: '😊',
    sad: '😢',
    anger: '😠',
    calm: '🌿',
    chaos: '🌀',
    hope: '✨',
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          {moodEmojis[event.globalMood] || '🌐'}
          {event.title}
        </CardTitle>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Event Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formatTimeRemaining(event.timeRemaining)} remaining</span>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            <span>{event.rewardXP} XP reward</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Global Event</span>
          </div>
        </div>

        {/* Global Mood */}
        <div className="bg-muted rounded-lg p-3">
          <div className="text-xs font-semibold text-muted-foreground mb-1">World Mood</div>
          <div className="text-sm font-semibold capitalize">
            {moodEmojis[event.globalMood]} {event.globalMood}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Reflection Questions</h3>
          <div className="space-y-2">
            {event.questionSet.map((question, index) => (
              <div
                key={index}
                className="bg-muted rounded-lg p-3 border border-border"
              >
                <div className="text-xs text-muted-foreground mb-1">Question {index + 1}</div>
                <div className="text-sm">{question}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Theme Info */}
        {event.theme && (
          <div className="text-xs text-muted-foreground">
            Theme: <span className="font-semibold capitalize">{event.theme}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

