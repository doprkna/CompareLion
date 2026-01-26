'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sparkles, Check } from 'lucide-react';
import { useDreamspace } from '@parel/core/hooks/useDreamspace';
import { Loader2 } from 'lucide-react';

const toneEmojis: Record<string, string> = {
  calm: '🌊',
  chaotic: '🌀',
  mystic: '✨',
};

export function DreamLog() {
  const { history, loading, error } = useDreamspace();

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center text-destructive">
          Error: {error}
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Dream Log
          </CardTitle>
          <CardDescription>Your dreamspace encounters</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No dreams yet. Keep reflecting to enter the Dreamspace...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="w-5 h-5" />
          Dream Log
        </CardTitle>
        <CardDescription>Your last {history.length} dreamspace encounters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {history.map((dream) => {
          const effect = dream.effect || {};
          const xpShift = effect.xpShift || 0;
          const karmaFlux = effect.karmaFlux || 0;
          const moodChange = effect.moodChange || null;

          return (
            <div
              key={dream.id}
              className={`bg-muted rounded-lg p-3 border-2 ${
                dream.resolved ? 'border-green-500/50' : 'border-purple-500/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{toneEmojis[dream.flavorTone] || '🌙'}</span>
                    <span className="font-semibold text-sm">{dream.title}</span>
                    {dream.resolved && (
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-600 rounded">
                        <Check className="w-3 h-3 inline mr-1" />
                        Resolved
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">{dream.description}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-2 mt-2">
                {xpShift !== 0 && (
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>XP: {xpShift > 0 ? '+' : ''}{xpShift}%</span>
                  </div>
                )}
                {karmaFlux !== 0 && (
                  <div className="flex items-center gap-1">
                    <Moon className="w-3 h-3" />
                    <span>Karma: {karmaFlux > 0 ? '+' : ''}{karmaFlux}</span>
                  </div>
                )}
                {moodChange && (
                  <div className="flex items-center gap-1">
                    <span>Mood: {moodChange}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 ml-auto">
                  <span>{new Date(dream.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

