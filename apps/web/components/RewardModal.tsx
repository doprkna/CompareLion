'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface RewardItem {
  type: 'xp' | 'gold' | 'diamonds' | 'hearts' | 'food';
  amount: number;
  label: string;
  emoji: string;
  color: string;
}

export interface DropItem {
  id: string;
  name: string;
  price: number;
  currency: 'gold' | 'diamond';
  icon: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface RewardModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  rewards: RewardItem[];
  drops?: DropItem[];
  stats?: Array<{ label: string; value: string | number }>;
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
    primary?: boolean;
  }>;
  type?: 'success' | 'neutral' | 'warning';
}

// Animated counter component
function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
}

// Confetti particle
function ConfettiParticle({ index }: { index: number }) {
  const randomX = (Math.random() - 0.5) * 400;
  const randomY = -100 - Math.random() * 200;
  const randomRotate = Math.random() * 720;
  const delay = index * 0.05;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0],
        x: randomX,
        y: randomY,
        rotate: randomRotate,
      }}
      transition={{
        duration: 2,
        delay,
        ease: 'easeOut',
      }}
      className="absolute text-2xl pointer-events-none"
      style={{
        left: '50%',
        top: '50%',
      }}
    >
      {['🎉', '✨', '⭐', '💫', '🌟'][index % 5]}
    </motion.div>
  );
}

export function RewardModal({
  open,
  onClose,
  title,
  subtitle,
  rewards,
  drops = [],
  stats = [],
  actions,
  type = 'success',
}: RewardModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const typeColors = {
    success: 'text-success',
    neutral: 'text-accent',
    warning: 'text-warning',
  };

  const rarityColors = {
    common: 'border-subtle',
    rare: 'border-accent',
    epic: 'border-[#a855f7]',
    legendary: 'border-[#f59e0b]',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-2 border-border">
        <DialogHeader>
          <DialogTitle className={`text-3xl font-bold text-center ${typeColors[type]}`}>
            {title}
          </DialogTitle>
          {subtitle && (
            <p className="text-center text-subtle mt-2">{subtitle}</p>
          )}
        </DialogHeader>

        {/* Confetti */}
        <AnimatePresence>
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-50">
              {[...Array(20)].map((_, i) => (
                <ConfettiParticle key={i} index={i} />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Rewards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 my-6"
        >
          {rewards.map((reward, index) => (
            <motion.div
              key={reward.type}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-bg border border-border rounded-lg p-4 text-center"
            >
              <div className="text-3xl mb-2">{reward.emoji}</div>
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: reward.color }}
              >
                +<AnimatedCounter value={reward.amount} duration={800} />
              </div>
              <div className="text-xs text-subtle">{reward.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Drops Section */}
        {drops.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-semibold text-text">Exclusive Drops</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {drops.map((drop, index) => (
                <motion.div
                  key={drop.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`bg-bg border-2 rounded-lg p-4 hover:shadow-lg transition-all ${
                    rarityColors[drop.rarity || 'common']
                  }`}
                >
                  <div className="text-4xl mb-2 text-center">{drop.icon}</div>
                  <h4 className="font-semibold text-text text-center mb-2 text-sm">
                    {drop.name}
                  </h4>
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    variant="outline"
                    onClick={() => console.log(`Purchase ${drop.name}`)}
                  >
                    Buy for {drop.price}
                    {drop.currency === 'gold' ? '💰' : '💎'}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats Section */}
        {stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-bg border border-border rounded-lg p-4 mb-6"
          >
            <h3 className="text-sm font-semibold text-text mb-3">Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-subtle">{stat.label}:</span>
                  <span className="text-sm font-semibold text-text">{stat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || 'outline'}
              className={`flex-1 ${action.primary ? 'bg-accent text-white hover:bg-accent/90' : ''}`}
            >
              {action.label}
            </Button>
          ))}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}










