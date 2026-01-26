'use client';

import { BadgeUnlockEvent } from '@parel/core/hooks/useBadgeNotification';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface BadgeToastProps {
  badge: BadgeUnlockEvent | null;
  onClose: () => void;
}

export function BadgeToast({ badge, onClose }: BadgeToastProps) {
  if (!badge) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.9 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
      >
        <div className="bg-card border-2 border-accent rounded-lg p-4 shadow-2xl flex items-center gap-4">
          {/* Badge Icon */}
          <div className="text-4xl">{badge.icon}</div>

          {/* Badge Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="font-bold text-text">🎖️ New Badge Unlocked!</span>
            </div>
            <p className="text-sm font-semibold text-text">{badge.name}</p>
            <p className="text-xs text-subtle">{badge.rarity} badge</p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-subtle hover:text-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

