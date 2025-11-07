'use client';

import { useState } from 'react';
import { useCurrentGeneration } from '@/hooks/useCurrentGeneration';
import { LegacyTimeline } from '@/components/generation/LegacyTimeline';
import { AscendModal } from '@/components/generation/AscendModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Loader2, Sparkles, Calendar } from 'lucide-react';

export default function LegacyPage() {
  const { current, loading, error, reload } = useCurrentGeneration();
  const [showAscendModal, setShowAscendModal] = useState(false);

  const handleAscended = () => {
    reload();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Crown className="w-8 h-8 text-yellow-500" />
          Generational Legacy
        </h1>
        <p className="text-muted-foreground">
          Your legacy across generations — inherit perks and build upon your past selves
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4">
          Error: {error}
        </div>
      )}

      {current && (
        <>
          {/* Current Generation Status */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Current Generation
              </CardTitle>
              <CardDescription>Your active generation and inherited perks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{current.currentGeneration || 1}</div>
                  <div className="text-xs text-muted-foreground">Current Gen</div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{current.prestigeCount || 0}</div>
                  <div className="text-xs text-muted-foreground">Prestige</div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{current.totalGenerations || 0}</div>
                  <div className="text-xs text-muted-foreground">Total Generations</div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{current.allInheritedPerks?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Inherited Perks</div>
                </div>
              </div>

              {current.currentGenerationRecord && (
                <div className="bg-muted rounded-lg p-3 border border-border">
                  <div className="text-xs font-semibold text-muted-foreground mb-1">Latest Summary</div>
                  <p className="text-sm italic text-muted-foreground">
                    {current.currentGenerationRecord.summaryText}
                  </p>
                </div>
              )}

              {current.allInheritedPerks && current.allInheritedPerks.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    All Inherited Perks
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {current.allInheritedPerks.map((perk: any, index: number) => (
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

              {current.canAscend && (
                <div className="flex justify-center pt-2">
                  <Button
                    onClick={() => setShowAscendModal(true)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    size="lg"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Ascend to Next Generation
                  </Button>
                </div>
              )}

              {!current.canAscend && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ You need Prestige 3 or higher to ascend to the next generation.
                    Current Prestige: {current.prestigeCount || 0}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legacy Timeline */}
          <LegacyTimeline />

          {/* Ascend Modal */}
          <AscendModal
            open={showAscendModal}
            onClose={() => setShowAscendModal(false)}
            currentGeneration={current.currentGeneration || 1}
            prestigeCount={current.prestigeCount || 0}
            canAscend={current.canAscend || false}
            onAscended={handleAscended}
          />
        </>
      )}
    </div>
  );
}

