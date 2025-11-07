'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Crown, Calendar } from 'lucide-react';

interface GenerationCardProps {
  generation: {
    id: string;
    generationNumber: number;
    inheritedPerks: Array<{ type: string; value: string | number; fromGeneration?: number }>;
    summaryText?: string | null;
    createdAt: string;
  };
}

export function GenerationCard({ generation }: GenerationCardProps) {
  const perks = generation.inheritedPerks || [];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          Generation {generation.generationNumber}
        </CardTitle>
        <CardDescription>
          {new Date(generation.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {generation.summaryText && (
          <div className="bg-muted rounded-lg p-3 border border-border">
            <p className="text-sm text-muted-foreground italic">{generation.summaryText}</p>
          </div>
        )}

        {perks.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Inherited Perks
            </div>
            <div className="space-y-1">
              {perks.map((perk, index) => (
                <div
                  key={index}
                  className="bg-muted rounded-lg p-2 border border-border text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold capitalize">{perk.type}:</span>
                    <span className="text-primary">{String(perk.value)}</span>
                    {perk.fromGeneration && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        (Gen {perk.fromGeneration})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

