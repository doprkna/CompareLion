'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 300);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-bg via-card to-bg flex items-center justify-center z-50">
      <div className="text-center space-y-8 max-w-md px-6">
        {/* Animated Logo/Orb */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-accent to-blue-500 shadow-2xl shadow-accent/50"
        />

        {/* App Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-text"
        >
          PareL
        </motion.h1>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="relative w-full h-2 bg-border/30 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-subtle text-sm">
            {progress < 30 && "Loading your experience..."}
            {progress >= 30 && progress < 60 && "Preparing your dashboard..."}
            {progress >= 60 && progress < 90 && "Almost ready..."}
            {progress >= 90 && "All set!"}
          </p>
        </div>
      </div>
    </div>
  );
}








