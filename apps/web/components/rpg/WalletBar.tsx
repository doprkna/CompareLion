/**
 * Wallet Bar Component
 * Displays wallet summary with real-time updates
 * v0.26.11 - UI Cohesion & Inventory Sync
 */

'use client';

import { useEffect, useState } from 'react';
import { useGold } from '@/hooks/useGold';
import { Coins, Gem } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WalletBarProps {
  showDiamonds?: boolean;
  compact?: boolean;
}

export function WalletBar({ showDiamonds = false, compact = false }: WalletBarProps) {
  const { gold, refreshGold, loading } = useGold();
  const [diamonds, setDiamonds] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);

  // Subscribe to wallet updates
  useEffect(() => {
    // Listen for wallet update events
    const handleWalletUpdate = () => {
      refreshGold();
      setPulseKey((prev) => prev + 1);
    };

    // Listen for custom wallet events (from purchases, rewards, etc.)
    if (typeof window !== 'undefined') {
      // Listen for custom wallet update events
      window.addEventListener('wallet:update', handleWalletUpdate);
      // Listen for inventory refresh (purchases/crafts update wallet)
      window.addEventListener('inventory:refresh', handleWalletUpdate);
      
      return () => {
        window.removeEventListener('wallet:update', handleWalletUpdate);
        window.removeEventListener('inventory:refresh', handleWalletUpdate);
      };
    }
  }, [refreshGold]);

  // Load diamonds if needed
  useEffect(() => {
    if (showDiamonds) {
      fetch('/api/wallet')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setDiamonds(data.diamonds || 0);
          }
        })
        .catch(() => {});
    }
  }, [showDiamonds]);

  if (loading && gold === 0) {
    return (
      <div className="flex items-center gap-4 text-gray-400 animate-pulse">
        <div className="h-8 w-24 bg-gray-700 rounded"></div>
        {showDiamonds && <div className="h-8 w-24 bg-gray-700 rounded"></div>}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${compact ? 'text-sm' : 'text-base'}`}>
      {/* Gold */}
      <motion.div
        key={`gold-${pulseKey}`}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 px-3 py-2 rounded-lg border border-yellow-500/30"
      >
        <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
        <span className="font-mono font-semibold text-yellow-300">
          {gold.toLocaleString()}
        </span>
        <span className="text-yellow-400 text-sm">🪙</span>
      </motion.div>

      {/* Diamonds */}
      {showDiamonds && (
        <motion.div
          key={`diamonds-${pulseKey}`}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-2 rounded-lg border border-purple-500/30"
        >
          <Gem className="h-4 w-4 sm:h-5 sm:w-5 text-purple-300" />
          <span className="font-mono font-semibold text-purple-200">
            {diamonds.toLocaleString()}
          </span>
          <span className="text-purple-300 text-sm">💎</span>
        </motion.div>
      )}
    </div>
  );
}

