'use client';

import { MarketItem } from '@/hooks/useMarket';
import { Button } from '@/components/ui/button';
import { X, ShoppingCart, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PurchaseModalProps {
  item: MarketItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  purchasing?: boolean;
  walletBalance?: number;
  success?: boolean;
}

export function PurchaseModal({
  item,
  isOpen,
  onClose,
  onConfirm,
  purchasing,
  walletBalance = 0,
  success,
}: PurchaseModalProps) {
  if (!item || !isOpen) return null;

  const canAfford = walletBalance >= item.price;
  const currencySymbol = item.currencyKey === 'gold' ? '🪙' : item.currencyKey === 'diamonds' ? '💎' : '⭐';

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
            {success ? (
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h3 className="text-2xl font-bold text-text">Purchase Complete!</h3>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-6 h-6 text-accent" />
                <h3 className="text-2xl font-bold text-text">Confirm Purchase</h3>
              </div>
            )}
            <p className="text-subtle font-semibold">{item.name}</p>
          </div>

          {/* Item Details */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-subtle">Price:</span>
                <span className="font-semibold text-text">
                  {currencySymbol} {item.price.toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtle">Your Balance:</span>
                <span className={cn('font-semibold', canAfford ? 'text-text' : 'text-red-500')}>
                  {currencySymbol} {walletBalance.toFixed(0)}
                </span>
              </div>
              {!canAfford && (
                <div className="text-xs text-red-500 mt-2">
                  💸 Insufficient funds — need {currencySymbol} {item.price.toFixed(0)}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={purchasing}
              className="flex-1"
            >
              Cancel
            </Button>
            {!success && (
              <Button
                onClick={onConfirm}
                disabled={!canAfford || purchasing}
                className="flex-1 bg-accent hover:bg-accent/90 text-white"
              >
                {purchasing ? 'Processing...' : 'Confirm Purchase'}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

