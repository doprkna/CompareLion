'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function StagingBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [env, setEnv] = useState<'staging' | 'beta' | null>(null);

  useEffect(() => {
    // Show in staging or beta environments
    const currentEnv = process.env.NEXT_PUBLIC_ENV;
    if (currentEnv === 'staging') {
      setIsVisible(true);
      setEnv('staging');
    } else if (currentEnv === 'beta') {
      setIsVisible(true);
      setEnv('beta');
    }
  }, []);

  if (!isVisible) return null;

  const isBeta = env === 'beta';
  const bgColor = isBeta 
    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
    : 'bg-gradient-to-r from-orange-500 to-red-500';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 ${bgColor} text-white text-center py-2 px-4 shadow-lg`}
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg">{isBeta ? '🚀' : '🧪'}</span>
          <span className="font-semibold">
            {isBeta ? 'PareL Beta v0.13.2k' : 'PareL – Test Build v0.13.2j'}
          </span>
          <span className="text-sm opacity-90">
            • {isBeta ? 'Public Beta' : 'Staging Environment'}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
