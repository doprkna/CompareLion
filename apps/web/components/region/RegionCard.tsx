'use client';

import { Region } from '@/hooks/useRegions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RegionBuffBadge } from './RegionBuffBadge';

interface RegionCardProps {
  region: Region;
  isActive?: boolean;
  onTravel?: () => void;
  onUnlock?: () => void;
  traveling?: boolean;
  unlocking?: boolean;
}

export function RegionCard({
  region,
  isActive,
  onTravel,
  onUnlock,
  traveling,
  unlocking,
}: RegionCardProps) {
  const isUnlocked = region.isUnlocked ?? false;
  const canUnlock = region.canUnlock ?? false;

  return (
    <Card
      className={cn(
        'relative transition-all',
        isActive && 'border-2 border-accent bg-accent/5',
        !isUnlocked && 'opacity-60'
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {isUnlocked ? (
                <MapPin className="w-5 h-5 text-accent" />
              ) : (
                <Lock className="w-5 h-5 text-subtle" />
              )}
              {region.name}
            </CardTitle>
            <CardDescription className="mt-1">{region.description}</CardDescription>
          </div>
          {isActive && (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-accent/20 text-accent">
              Active
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Buff Badge */}
        <RegionBuffBadge buffType={region.buffType} buffValue={region.buffValue} />

        {/* Unlock Requirements */}
        {!isUnlocked && region.unlockRequirementType && (
          <div className="text-sm text-subtle">
            Unlock: {region.unlockRequirementType === 'level' && `Level ${region.unlockRequirementValue}`}
            {region.unlockRequirementType === 'gold' && `${region.unlockRequirementValue} gold`}
            {region.unlockRequirementType === 'task' && `Complete task`}
            {region.unlockRequirementType === 'achievement' && `Achievement required`}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {isUnlocked && !isActive && (
            <Button
              onClick={onTravel}
              disabled={traveling}
              className="flex-1 bg-accent hover:bg-accent/90 text-white"
            >
              {traveling ? 'Traveling...' : 'Travel'}
            </Button>
          )}
          {canUnlock && (
            <Button
              onClick={onUnlock}
              disabled={unlocking}
              variant="outline"
              className="flex-1"
            >
              {unlocking ? 'Unlocking...' : 'Unlock'}
            </Button>
          )}
          {!isUnlocked && !canUnlock && (
            <Button disabled variant="outline" className="flex-1">
              <Lock className="w-4 h-4 mr-2" />
              Locked
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

