'use client';

import { useState } from 'react';
import { usePrestigeStatus } from '@/hooks/usePrestigeStatus';
import { useActivatePrestige } from '@/hooks/useActivatePrestige';
import { usePrestigeHistory } from '@/hooks/usePrestigeHistory';
import { PrestigeBadge } from '@/components/prestige/PrestigeBadge';
import { PrestigeClaimModal } from '@/components/prestige/PrestigeClaimModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Loader2, Calendar, Gift, Sparkles } from 'lucide-react';

export default function PrestigePage() {
  const { status, loading: statusLoading, error: statusError, reload: reloadStatus } = usePrestigeStatus();
  const { history, loading: historyLoading, error: historyError } = usePrestigeHistory();
  const { activate, loading: activateLoading, error: activateError } = useActivatePrestige();
  const [showClaimModal, setShowClaimModal] = useState(false);

  const handleActivate = async () => {
    try {
      const result = await activate();
      setShowClaimModal(false);
      reloadStatus();
      // Show success message
      alert(result?.message || '🏆 Prestige activated successfully!');
    } catch (e) {
      console.error('Prestige activation failed:', e);
    }
  };

  if (statusLoading || historyLoading) {
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
          <Trophy className="w-8 h-8 text-yellow-500" />
          Prestige System
        </h1>
        <p className="text-muted-foreground">
          Reset your season progress to unlock new titles, badges, and color themes
        </p>
      </div>

      {statusError && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4">
          Error: {statusError}
        </div>
      )}

      {activateError && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4">
          Activation error: {activateError}
        </div>
      )}

      {status && (
        <>
          {/* Current Status */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Current Prestige Status
              </CardTitle>
              <CardDescription>Your current prestige level and progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <PrestigeBadge
                  prestigeCount={status.prestigeCount || 0}
                  prestigeTitle={status.prestigeTitle}
                  prestigeColorTheme={status.prestigeColorTheme}
                  size="lg"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{status.prestigeCount || 0}</div>
                  <div className="text-xs text-muted-foreground">Prestige Level</div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{status.seasonLevel || 1}</div>
                  <div className="text-xs text-muted-foreground">Season Level</div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{status.seasonXP || 0}</div>
                  <div className="text-xs text-muted-foreground">Season XP</div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{status.progressToNext?.toFixed(0) || 0}%</div>
                  <div className="text-xs text-muted-foreground">Progress</div>
                </div>
              </div>

              {status.seasonLevel < 50 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress to Prestige</span>
                    <span>{status.seasonLevel || 1} / 50</span>
                  </div>
                  <Progress value={status.progressToNext || 0} className="w-full" />
                </div>
              )}

              {status.canPrestige && (
                <div className="flex justify-center pt-2">
                  <Button
                    onClick={() => setShowClaimModal(true)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    size="lg"
                  >
                    <Gift className="w-5 h-5 mr-2" />
                    Activate Prestige
                  </Button>
                </div>
              )}

              {status.prestigeTitle && (
                <div className="bg-muted rounded-lg p-3 mt-4">
                  <div className="text-xs font-semibold text-muted-foreground mb-1">Current Title</div>
                  <div className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    {status.prestigeTitle}
                  </div>
                </div>
              )}

              {status.prestigeBadge && (
                <div className="bg-muted rounded-lg p-3 mt-2">
                  <div className="text-xs font-semibold text-muted-foreground mb-1">Prestige Badge</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{status.prestigeBadge.icon}</span>
                    <span className="font-semibold">{status.prestigeBadge.name}</span>
                  </div>
                </div>
              )}

              {status.prestigeColorTheme && (
                <div className="bg-muted rounded-lg p-3 mt-2">
                  <div className="text-xs font-semibold text-muted-foreground mb-1">Color Theme</div>
                  <div className="text-sm font-semibold capitalize">{status.prestigeColorTheme}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Prestige History */}
      {history && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Prestige History
            </CardTitle>
            <CardDescription>Your previous prestige activations</CardDescription>
          </CardHeader>
          <CardContent>
            {historyError && (
              <div className="bg-destructive/10 text-destructive rounded-lg p-4 mb-4">
                Error: {historyError}
              </div>
            )}

            {history.prestigeRecords && history.prestigeRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No prestige records yet. Activate your first prestige to begin!
              </p>
            ) : (
              <div className="space-y-3">
                {history.prestigeRecords?.map((record: any) => (
                  <div
                    key={record.id}
                    className="bg-muted rounded-lg p-4 border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">Prestige #{record.prestigeCount}</span>
                        {record.prestigeTitle && (
                          <span className="text-sm text-muted-foreground">• {record.prestigeTitle}</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-semibold">Level:</span> {record.oldLevel}
                      </div>
                      <div>
                        <span className="font-semibold">Legacy XP:</span> {record.legacyXP.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-semibold">Season:</span> {record.season?.title || 'N/A'}
                      </div>
                      {record.prestigeColorTheme && (
                        <div>
                          <span className="font-semibold">Theme:</span> <span className="capitalize">{record.prestigeColorTheme}</span>
                        </div>
                      )}
                    </div>
                    {record.prestigeBadge && (
                      <div className="mt-2 pt-2 border-t border-border flex items-center gap-2">
                        <span className="text-lg">{record.prestigeBadge.icon}</span>
                        <span className="text-xs font-semibold">{record.prestigeBadge.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <PrestigeClaimModal
        open={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        onConfirm={handleActivate}
        loading={activateLoading}
        prestigeCount={status?.prestigeCount || 0}
        seasonLevel={status?.seasonLevel || 1}
        canPrestige={status?.canPrestige || false}
      />
    </div>
  );
}

