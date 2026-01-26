'use client';

import { Quest } from '@parel/core/hooks/useQuests';
import { QuestLore } from '@parel/core/hooks/useQuestLore';
import { Button } from '@/components/ui/button';
import { X, Gift, ScrollText, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuestCompletionModalProps {
  quest: Quest | null;
  lore: QuestLore | null;
  isOpen: boolean;
  onClose: () => void;
  rewards: {
    xp: number;
    gold: number;
    karma: number;
    badge?: string | null;
    item?: string | null;
  };
}

const toneIcons = {
  serious: ScrollText,
  comedic: Zap,
  poetic: Sparkles,
};

const toneColors = {
  serious: 'text-blue-500 dark:text-blue-400',
  comedic: 'text-yellow-500 dark:text-yellow-400',
  poetic: 'text-purple-500 dark:text-purple-400',
};

export function QuestCompletionModal({
  quest,
  lore,
  isOpen,
  onClose,
  rewards,
}: QuestCompletionModalProps) {
  if (!quest || !isOpen) return null;

  const Icon = lore ? toneIcons[lore.tone] : Gift;

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
              <Gift className="w-6 h-6 text-accent" />
              <h3 className="text-2xl font-bold text-text">Quest Complete!</h3>
            </div>
            <p className="text-subtle font-semibold">{quest.title}</p>
          </div>

          {/* Rewards */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-text mb-2">Rewards:</p>
            <div className="space-y-1 text-sm">
              {rewards.xp > 0 && (
                <div className="flex items-center gap-2 text-text">
                  <span>💫</span>
                  <span>+{rewards.xp} XP</span>
                </div>
              )}
              {rewards.gold > 0 && (
                <div className="flex items-center gap-2 text-text">
                  <span>🪙</span>
                  <span>+{rewards.gold} Gold</span>
                </div>
              )}
              {rewards.karma > 0 && (
                <div className="flex items-center gap-2 text-text">
                  <span>⭐</span>
                  <span>+{rewards.karma} Karma</span>
                </div>
              )}
              {rewards.badge && (
                <div className="flex items-center gap-2 text-text">
                  <span>🏅</span>
                  <span>Badge: {rewards.badge}</span>
                </div>
              )}
              {rewards.item && (
                <div className="flex items-center gap-2 text-text">
                  <span>🎁</span>
                  <span>Item: {rewards.item}</span>
                </div>
              )}
            </div>
          </div>

          {/* Lore Preview */}
          {lore && (
            <div className="bg-card border border-border rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn('w-5 h-5', toneColors[lore.tone])} />
                <p className="text-sm font-semibold text-text">📜 Your story grows…</p>
              </div>
              <p className="text-sm text-text italic leading-relaxed">{lore.text}</p>
            </div>
          )}

          {/* Actions */}
          <Button
            onClick={onClose}
            className="w-full bg-accent hover:bg-accent/90 text-white"
          >
            Continue
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

