'use client';

import { Badge } from '@parel/core/hooks/useBadges';
import { Button } from '@/components/ui/button';
import { X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useClaimBadge } from '@parel/core/hooks/useClaimBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BadgePopupProps {
  badge: Badge | null;
  onClose: () => void;
  onClaimed?: () => void;
}

export function BadgePopup({ badge, onClose, onClaimed }: BadgePopupProps) {
  const { claimBadge, loading } = useClaimBadge();
  const [claimed, setClaimed] = useState(false);

  if (!badge) return null;

  const handleClaim = async () => {
      if (!badge.id || !badge.canClaim) return;

      try {
        // Use userBadgeId if available (from user badges), otherwise use badge.id
        const userBadgeId = badge.userBadgeId || badge.id;
        await claimBadge(userBadgeId);
      setClaimed(true);
      onClaimed?.();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to claim badge:', err);
    }
  };

  const isUnlocked = badge.isUnlocked ?? false;
  const hasReward = badge.rewardType && badge.rewardValue;
  const canClaim = !badge.isClaimed && hasReward && isUnlocked;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-card border-2 border-border rounded-xl p-6 max-w-md w-full relative shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-subtle hover:text-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className={cn(
              'w-24 h-24 rounded-full border-4 flex items-center justify-center text-5xl',
              isUnlocked ? 'border-accent bg-accent/10' : 'border-subtle bg-subtle/10'
            )}>
              {badge.icon}
            </div>
          </div>

          {/* Badge Info */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-text mb-2">{badge.name}</h3>
            <p className="text-subtle mb-2">{badge.description}</p>
            <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-semibold">
              {badge.rarity}
            </div>
          </div>

          {/* Reward Preview */}
          {hasReward && (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-accent">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold">Reward:</span>
              </div>
              <p className="text-text mt-1">
                {badge.rewardType === 'currency' && `+${badge.rewardValue} 💎`}
                {badge.rewardType === 'item' && `Item: ${badge.rewardValue}`}
                {badge.rewardType === 'title' && `Title: ${badge.rewardValue}`}
              </p>
            </div>
          )}

          {/* Claim Button */}
          {isUnlocked && canClaim && !claimed && (
            <Button
              onClick={handleClaim}
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 text-white"
            >
              {loading ? 'Claiming...' : 'Claim Reward'}
            </Button>
          )}

          {isUnlocked && badge.isClaimed && (
            <div className="text-center text-green-500 font-semibold">
              ✓ Reward Claimed
            </div>
          )}

          {claimed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-green-500 font-semibold"
            >
              ✓ Reward Claimed!
            </motion.div>
          )}

          {!isUnlocked && (
            <div className="text-center text-subtle">
              Complete requirements to unlock this badge
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

