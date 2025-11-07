'use client';

import { useState } from 'react';
import { useSeason } from '@/hooks/useSeason';
import { usePrestige } from '@/hooks/usePrestige';
import { useLegacy } from '@/hooks/useLegacy';
import { SeasonCard } from '@/components/meta/SeasonCard';
import { PrestigeModal } from '@/components/meta/PrestigeModal';
import { LegacyTimeline } from '@/components/meta/LegacyTimeline';
import { Button } from '@/components/ui/button';
import { Trophy, Loader2 } from 'lucide-react';

export default function ProgressionPage() {
  const { season, userProgress, loading: seasonLoading, error: seasonError, reload: reloadSeason } = useSeason();
  const { legacy, loading: legacyLoading, error: legacyError } = useLegacy();
  const { prestige, loading: prestigeLoading, error: prestigeError } = usePrestige();
  const [showPrestigeModal, setShowPrestigeModal] = useState(false);

  const handlePrestige = async () => {
    try {
      const result = await prestige();
      setShowPrestigeModal(false);
      reloadSeason();
      if (legacy) {
        // Reload legacy data
        window.location.reload(); // Simple refresh for now
      }
      // Show success toast with badge/title info
      const message = result?.message || '🏆 Prestige achieved!';
      alert(message);
    } catch (e) {
      // Error already handled by hook
      console.error('Prestige failed:', e);
    }
  };

  if (seasonLoading || legacyLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Meta-Progression</h1>
        <p className="text-muted-foreground">
          Track your seasonal progress, prestige achievements, and legacy journey.
        </p>
      </div>

      {seasonError && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4">
          Error: {seasonError}
        </div>
      )}

      {legacyError && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4">
          Error loading legacy: {legacyError}
        </div>
      )}

      {prestigeError && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4">
          Prestige error: {prestigeError}
        </div>
      )}

      <SeasonCard season={season} userProgress={userProgress || { seasonLevel: 1, seasonXP: 0, prestigeCount: 0 }} />

      <div className="flex justify-center">
        <Button
          onClick={() => setShowPrestigeModal(true)}
          disabled={prestigeLoading || !userProgress || userProgress.seasonLevel < 50}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
          size="lg"
        >
          <Trophy className="w-5 h-5 mr-2" />
          {prestigeLoading ? 'Processing...' : 'Prestige'}
        </Button>
      </div>

      {legacy && <LegacyTimeline legacy={legacy} />}

      <PrestigeModal
        open={showPrestigeModal}
        onClose={() => setShowPrestigeModal(false)}
        onConfirm={handlePrestige}
        loading={prestigeLoading}
        seasonLevel={userProgress?.seasonLevel || 1}
        prestigeCount={userProgress?.prestigeCount || 0}
      />
    </div>
  );
}

