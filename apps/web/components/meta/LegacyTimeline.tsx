'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Calendar } from 'lucide-react';

interface LegacyTimelineProps {
  legacy: {
    prestigeCount: number;
    totalLegacyXP: number;
    legacyPerk?: string;
    prestigeRecords: Array<{
      id: string;
      season: {
        id: string;
        key: string;
        title: string;
      };
      oldLevel: number;
      legacyXP: number;
      prestigeCount: number;
      badge?: {
        id: string;
        key: string;
        name: string;
        icon: string;
        rarity: string;
        description: string;
      } | null;
      createdAt: string;
    }>;
    pastSeasons: Array<{
      id: string;
      key: string;
      title: string;
      startDate: string;
      endDate?: string;
    }>;
  };
}

export function LegacyTimeline({ legacy }: LegacyTimelineProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Legacy Summary
        </CardTitle>
        <CardDescription>Your journey across seasons</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4 pb-4 border-b">
          <div className="text-center">
            <div className="text-2xl font-bold">{legacy.prestigeCount}</div>
            <div className="text-xs text-muted-foreground">Prestiges</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{legacy.totalLegacyXP.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Legacy XP</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{legacy.pastSeasons.length}</div>
            <div className="text-xs text-muted-foreground">Seasons</div>
          </div>
        </div>

        {legacy.legacyPerk && (
          <div className="bg-muted rounded-lg p-3">
            <div className="text-sm font-semibold mb-1">Active Legacy Perk:</div>
            <div className="text-sm text-muted-foreground">{legacy.legacyPerk}</div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Prestige Records</h3>
          {legacy.prestigeRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground">No prestige records yet</p>
          ) : (
            <div className="space-y-2">
              {legacy.prestigeRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-muted rounded-lg p-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{record.season.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Level {record.oldLevel} → Reset</span>
                    <span>•</span>
                    <span>Legacy XP: {record.legacyXP.toLocaleString()}</span>
                    <span>•</span>
                    <span>Prestige #{record.prestigeCount}</span>
                  </div>
                  {record.badge && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                      <span className="text-lg">{record.badge.icon}</span>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-text">
                          {record.badge.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {record.badge.description}
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-muted rounded capitalize">
                        {record.badge.rarity}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 pt-4 border-t">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Past Seasons
          </h3>
          {legacy.pastSeasons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No past seasons</p>
          ) : (
            <div className="space-y-2">
              {legacy.pastSeasons.map((season) => (
                <div
                  key={season.id}
                  className="bg-muted rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold">{season.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(season.startDate).toLocaleDateString()}
                      {season.endDate && ` - ${new Date(season.endDate).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

