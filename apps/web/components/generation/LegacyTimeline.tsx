'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GenerationCard } from './GenerationCard';
import { Timeline, Calendar, Crown } from 'lucide-react';
import { useGenerations } from '@parel/core/hooks/useGenerations';
import { Loader2 } from 'lucide-react';

export function LegacyTimeline() {
  const { generations, loading, error } = useGenerations();

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

  if (!generations || !generations.generations || generations.generations.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timeline className="w-5 h-5" />
            Legacy Timeline
          </CardTitle>
          <CardDescription>Your generational legacy chain</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No generations yet. Ascend to create your first generation!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timeline className="w-5 h-5" />
          Legacy Timeline
        </CardTitle>
        <CardDescription>
          Your generational legacy chain — {generations.total || 0} {generations.total === 1 ? 'generation' : 'generations'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <div className="text-center">
            <div className="text-2xl font-bold flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Gen {generations.currentGeneration || 1}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Current Generation</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{generations.total || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Generations</div>
          </div>
        </div>

        <div className="space-y-4">
          {generations.generations.map((generation: any, index: number) => (
            <div key={generation.id} className="relative">
              {/* Timeline connector */}
              {index < generations.generations.length - 1 && (
                <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border" />
              )}
              <GenerationCard generation={generation} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

