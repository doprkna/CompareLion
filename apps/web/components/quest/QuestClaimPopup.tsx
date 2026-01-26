'use client';

import { Quest } from '@parel/core/hooks/useQuests';
import { Button } from '@/components/ui/button';
import { X, Gift, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestClaimPopupProps {
  quest: Quest | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  claiming?: boolean;
}

export function QuestClaimPopup({
  quest,
  isOpen,
  onClose,
  onConfirm,
  claiming,
}: QuestClaimPopupProps) {
  if (!quest || !isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-card border-2 border-accent rounded-xl p-6 max-w-md w-full relative shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-subtle hover:text-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-accent" />
              <h3 className="text-2xl font-bold text-text">Quest Completed!</h3>
            </div>
            <p className="text-subtle">{quest.title}</p>
          </div>

          {/* Rewards */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-text mb-2">Rewards:</p>
            <div className="space-y-1 text-sm">
              {quest.rewardXP > 0 && (
                <div className="flex items-center gap-2 text-text">
                  <span>💫</span>
                  <span>+{quest.rewardXP} XP</span>
                </div>
              )}
              {quest.rewardGold > 0 && (
                <div className="flex items-center gap-2 text-text">
                  <span>🪙</span>
                  <span>+{quest.rewardGold} Gold</span>
                </div>
              )}
              {quest.rewardKarma > 0 && (
                <div className="flex items-center gap-2 text-text">
                  <span>⭐</span>
                  <span>+{quest.rewardKarma} Karma</span>
                </div>
              )}
              {quest.rewardBadge && (
                <div className="flex items-center gap-2 text-text">
                  <span>🏅</span>
                  <span>Badge: {quest.rewardBadge}</span>
                </div>
              )}
              {quest.rewardItem && (
                <div className="flex items-center gap-2 text-text">
                  <span>🎁</span>
                  <span>Item: {quest.rewardItem}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={claiming}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={claiming}
              className="flex-1 bg-accent hover:bg-accent/90 text-white"
            >
              <Gift className="w-4 h-4 mr-2" />
              {claiming ? 'Claiming...' : 'Claim Reward'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

