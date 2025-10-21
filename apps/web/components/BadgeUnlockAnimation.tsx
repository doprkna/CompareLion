'use client';

/**
 * BadgeUnlockAnimation Component
 * 
 * Celebratory animation when user unlocks a badge/achievement.
 * Uses Framer Motion + confetti effect.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BadgeData {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity?: "common" | "rare" | "epic" | "legendary";
  xpReward?: number;
}

interface BadgeUnlockAnimationProps {
  badge: BadgeData;
  show: boolean;
  onClose: () => void;
}

export default function BadgeUnlockAnimation({
  badge,
  show,
  onClose,
}: BadgeUnlockAnimationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; rotation: number; delay: number }>>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti particles
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.5,
      }));
      setConfetti(particles);

      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const rarityColors = {
    common: "from-zinc-500 to-zinc-600",
    rare: "from-blue-500 to-blue-600",
    epic: "from-purple-500 to-purple-600",
    legendary: "from-yellow-500 to-orange-500",
  };

  const rarityGlow = {
    common: "shadow-zinc-500/50",
    rare: "shadow-blue-500/50",
    epic: "shadow-purple-500/50",
    legendary: "shadow-yellow-500/50",
  };

  const rarity = badge.rarity || "common";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Confetti Particles */}
          {confetti.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: `hsl(${Math.random() * 360}, 80%, 60%)`,
                top: "50%",
                left: "50%",
              }}
              initial={{ opacity: 1, scale: 0 }}
              animate={{
                opacity: 0,
                scale: 1,
                x: particle.x * 5,
                y: -300 + Math.random() * 100,
                rotate: particle.rotation,
              }}
              transition={{
                duration: 2,
                delay: particle.delay,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Main Badge Card */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full mx-4"
          >
            <div
              className={`bg-gradient-to-br ${rarityColors[rarity]} rounded-2xl p-1 shadow-2xl ${rarityGlow[rarity]}`}
            >
              <div className="bg-zinc-900 rounded-xl p-8 text-center space-y-6">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Sparkle Header */}
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="flex justify-center"
                >
                  <Sparkles className="h-12 w-12 text-yellow-400" />
                </motion.div>

                {/* Badge Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-8xl"
                >
                  {badge.icon}
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Achievement Unlocked!
                  </h2>
                  <h3 className="text-2xl font-semibold text-yellow-400">
                    {badge.title}
                  </h3>
                </motion.div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-zinc-300"
                >
                  {badge.description}
                </motion.p>

                {/* XP Reward */}
                {badge.xpReward && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 }}
                    className="flex items-center justify-center gap-2 bg-blue-500/20 border border-blue-500/50 rounded-lg py-3 px-6"
                  >
                    <Sparkles className="h-5 w-5 text-blue-400" />
                    <span className="text-xl font-bold text-blue-400">
                      +{badge.xpReward} XP
                    </span>
                  </motion.div>
                )}

                {/* Rarity Badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  className="inline-block"
                >
                  <div className={`px-4 py-1 rounded-full bg-gradient-to-r ${rarityColors[rarity]} text-white text-sm font-bold uppercase tracking-wider`}>
                    {rarity}
                  </div>
                </motion.div>

                {/* Continue Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 }}
                >
                  <Button
                    onClick={onClose}
                    className="w-full bg-white text-black hover:bg-zinc-200 font-bold"
                  >
                    Continue
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Pulsing Glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[rarity]} blur-3xl`} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}











