'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp } from 'lucide-react';

interface SeasonCardProps {
  season: any;
  userProgress: {
    seasonLevel: number;
    seasonXP: number;
    prestigeCount: number;
  };
}

export function SeasonCard({ season, userProgress }: SeasonCardProps) {
  const calculateXPForNextLevel = (level: number) => {
    // Simple formula: XP needed = level * 100
    return level * 100;
  };

  const xpForNextLevel = calculateXPForNextLevel(userProgress.seasonLevel);
  const xpProgress = userProgress.seasonXP;
  const progressPercent = Math.min(100, (xpProgress / xpForNextLevel) * 100);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {season?.title || 'No Active Season'}
        </CardTitle>
        <CardDescription>
          {season?.description || 'Season progression and prestige'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {season && (
          <div className="text-sm text-muted-foreground">
            {season.endDate ? (
              <div>
                Ends: {new Date(season.endDate).toLocaleDateString()}
              </div>
            ) : (
              <div>Active season</div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Level {userProgress.seasonLevel}
            </span>
            <span className="text-muted-foreground">
              {xpProgress} / {xpForNextLevel} XP
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm pt-2 border-t">
          <span className="text-muted-foreground">Prestige Count:</span>
          <span className="font-semibold">#{userProgress.prestigeCount}</span>
        </div>
      </CardContent>
    </Card>
  );
}

