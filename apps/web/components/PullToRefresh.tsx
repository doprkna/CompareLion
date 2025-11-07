'use client';

import { useRef, ReactNode } from 'react';
import { usePullToRefresh } from '@/hooks/useTouchGestures';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80 
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isPulling, pullDistance, isRefreshing } = usePullToRefresh(
    containerRef,
    onRefresh,
    threshold
  );

  const rotation = Math.min(pullDistance / threshold, 1) * 360;
  const opacity = Math.min(pullDistance / threshold, 1);

  return (
    <div ref={containerRef} className="relative overflow-y-auto h-full">
      {/* Pull indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-0 left-0 right-0 flex items-center justify-center h-16 z-10"
          >
            <div className="bg-purple-600 rounded-full p-2 shadow-lg">
              {isRefreshing ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <motion.div
                  animate={{ rotate: rotation }}
                  style={{ opacity }}
                >
                  <span className="text-2xl">🦁</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        animate={{
          paddingTop: isPulling ? `${Math.min(pullDistance, threshold)}px` : 0,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

