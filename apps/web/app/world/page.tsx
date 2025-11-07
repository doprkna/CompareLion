'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RegionCard } from '@/components/region/RegionCard';
import { TravelModal } from '@/components/region/TravelModal';
import { useRegions, useTravel, useUnlockRegion, Region } from '@/hooks/useRegions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Map, Loader2, Sparkles } from 'lucide-react';

export default function WorldPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [showTravelModal, setShowTravelModal] = useState(false);
  const [action, setAction] = useState<'travel' | 'unlock' | null>(null);

  const { regions, loading, error, reload, activeRegionId } = useRegions();
  const { travel, loading: traveling, error: travelError } = useTravel();
  const { unlock, loading: unlocking, error: unlockError } = useUnlockRegion();

  const handleTravelClick = (region: Region) => {
    setSelectedRegion(region);
    setAction('travel');
    setShowTravelModal(true);
  };

  const handleUnlockClick = async (region: Region) => {
    try {
      await unlock(region.id);
      alert(`Region ${region.name} unlocked!`);
      reload();
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleConfirmTravel = async () => {
    if (!selectedRegion) return;
    try {
      await travel(selectedRegion.id);
      alert(`🧭 You traveled to ${selectedRegion.name} (+${(selectedRegion.buffValue * 100).toFixed(1)}% ${selectedRegion.buffType}).`);
      setShowTravelModal(false);
      setSelectedRegion(null);
      reload();
    } catch (err) {
      // Error handled by hook
    }
  };

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-subtle" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-2">
          <Map className="w-8 h-8" />
          World & Exploration
        </h1>
        <p className="text-subtle">Travel between regions and discover new areas</p>
      </div>

      {/* Error States */}
      {error && (
        <Card className="bg-card border-red-500/20 mb-6">
          <CardContent className="p-4">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Regions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions.map((region) => (
          <RegionCard
            key={region.id}
            region={region}
            isActive={region.id === activeRegionId}
            onTravel={() => handleTravelClick(region)}
            onUnlock={() => handleUnlockClick(region)}
            traveling={traveling && selectedRegion?.id === region.id}
            unlocking={unlocking && selectedRegion?.id === region.id}
          />
        ))}
      </div>

      {/* No Regions Message */}
      {regions.length === 0 && !loading && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-subtle" />
            <h3 className="text-xl font-semibold text-text mb-2">No Regions Available</h3>
            <p className="text-subtle">Regions will be available soon!</p>
          </CardContent>
        </Card>
      )}

      {/* Travel Modal */}
      {showTravelModal && selectedRegion && (
        <TravelModal
          region={selectedRegion}
          isOpen={showTravelModal}
          onClose={() => {
            setShowTravelModal(false);
            setSelectedRegion(null);
          }}
          onConfirm={handleConfirmTravel}
          traveling={traveling}
        />
      )}
    </div>
  );
}

