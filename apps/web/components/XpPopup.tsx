'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export interface XpPopupProps {
  amount: number;
  onComplete: () => void;
  offsetX?: number;
  offsetY?: number;
  variant?: 'xp' | 'coins' | 'diamonds' | 'streak';
}

const VARIANT_CONFIG = {
  xp: { emoji: '✨', label: 'XP', color: 'var(--color-accent)' },
  coins: { emoji: '🪙', label: 'Coins', color: '#fbbf24' },
  diamonds: { emoji: '💎', label: 'Gems', color: '#a855f7' },
  streak: { emoji: '🔥', label: 'Streak', color: '#f97316' },
};

export function XpPopup({
  amount,
  onComplete,
  offsetX = 0,
  offsetY = 0,
  variant = 'xp',
}: XpPopupProps) {
  const config = VARIANT_CONFIG[variant];

  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.8,
        y: 0,
        x: offsetX,
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.8, 1.2, 1, 1],
        y: [0, -60 + offsetY],
      }}
      transition={{
        duration: 1.2,
        times: [0, 0.2, 0.6, 1],
        ease: 'easeOut',
      }}
      className="pointer-events-none fixed z-[9999] flex items-center gap-2"
      style={{
        left: '50%',
        top: '40%',
        transform: 'translateX(-50%)',
      }}
    >
      {/* Main XP Text */}
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.4, times: [0, 0.5, 1] }}
        className="flex items-center gap-2 rounded-full bg-card/90 backdrop-blur-md border-2 px-6 py-3 shadow-2xl"
        style={{
          borderColor: config.color,
          boxShadow: `0 0 30px ${config.color}40, 0 0 60px ${config.color}20`,
        }}
      >
        {/* Emoji */}
        <motion.span
          initial={{ rotate: -10, scale: 1 }}
          animate={{ rotate: [0, 10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="text-3xl"
        >
          {config.emoji}
        </motion.span>

        {/* Amount */}
        <span
          className="text-3xl font-black tracking-tight"
          style={{
            color: config.color,
            textShadow: `0 0 20px ${config.color}, 0 0 40px ${config.color}80`,
          }}
        >
          +{amount}
        </span>

        {/* Label */}
        <span
          className="text-xl font-bold"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      </motion.div>

      {/* Sparkle particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            scale: 0,
            x: 0,
            y: 0,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0.5],
            x: [(i - 1) * 40, (i - 1) * 60],
            y: [0, -80 - i * 10],
          }}
          transition={{
            duration: 1,
            delay: 0.1 + i * 0.1,
            ease: 'easeOut',
          }}
          className="absolute text-2xl"
          style={{
            left: '50%',
            top: '50%',
          }}
        >
          ✨
        </motion.div>
      ))}

      {/* Glow pulse effect */}
      <motion.div
        initial={{ scale: 1, opacity: 0.5 }}
        animate={{
          scale: [1, 1.5, 2],
          opacity: [0.5, 0.3, 0],
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background: `radial-gradient(circle, ${config.color}60 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  );
}










