/**
 * LevelUpPopup Component
 * 
 * Displays a celebration animation when user levels up.
 * Uses Framer Motion for smooth animations.
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Sparkles } from "lucide-react";

interface LevelUpPopupProps {
  show: boolean;
  level: number;
  onComplete: () => void;
}

export function LevelUpPopup({ show, level, onComplete }: LevelUpPopupProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          onAnimationComplete={() => {
            setTimeout(onComplete, 2000);
          }}
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 shadow-2xl border-4 border-yellow-400 max-w-md text-center"
            style={{
              boxShadow: "0 0 50px rgba(168, 85, 247, 0.8), 0 0 100px rgba(59, 130, 246, 0.6)",
            }}
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1, 1.1, 1],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="mb-4"
            >
              <TrendingUp className="h-20 w-20 text-yellow-300 mx-auto" />
            </motion.div>

            <h2 className="text-4xl font-bold text-white mb-2">
              LEVEL UP!
            </h2>
            
            <div className="text-6xl font-black text-yellow-300 my-4">
              {level}
            </div>

            <p className="text-white text-lg font-semibold mb-4">
              Congratulations! You've reached a new level!
            </p>

            {/* Sparkle particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [-20, -60, -100],
                  x: [(i - 3) * 20, (i - 3) * 40, (i - 3) * 60],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="absolute text-4xl"
                style={{ left: `${50 + (i - 3) * 5}%`, top: "50%" }}
              >
                <Sparkles className="h-6 w-6 text-yellow-300" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}










