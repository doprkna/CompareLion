'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Gift, Clock } from 'lucide-react';
import { useWildcards } from '@/hooks/useWildcards';
import { Loader2 } from 'lucide-react';

export function WildcardList() {
  const { wildcards, loading, error } = useWildcards();

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

  if (wildcards.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Wildcard Events
          </CardTitle>
          <CardDescription>Your recent wildcard triggers</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No wildcard events yet. Keep playing to trigger random humorous events!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Recent Wildcard Events
        </CardTitle>
        <CardDescription>Your last {wildcards.length} wildcard triggers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {wildcards.map((wildcard) => (
          <div
            key={wildcard.id}
            className={`bg-muted rounded-lg p-3 border-2 ${
              wildcard.redeemed ? 'border-green-500/50' : 'border-yellow-500/50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🎲</span>
                  <span className="font-semibold text-sm">{wildcard.title}</span>
                  {wildcard.redeemed && (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-600 rounded">
                      Claimed
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mb-2">{wildcard.description}</div>
                <div className="text-sm font-semibold text-primary mb-1">{wildcard.flavorText}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-2 mt-2">
              <div className="flex items-center gap-1">
                <Gift className="w-3 h-3" />
                <span>+{wildcard.rewardXP} XP</span>
              </div>
              {wildcard.rewardKarma > 0 && (
                <div className="flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  <span>+{wildcard.rewardKarma} Karma</span>
                </div>
              )}
              <div className="flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3" />
                <span>{new Date(wildcard.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

