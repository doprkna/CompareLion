'use client';

import { Region } from '@/hooks/useRegions';
import { Button } from '@/components/ui/button';
import { X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RegionBuffBadge } from './RegionBuffBadge';

interface TravelModalProps {
  region: Region | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  traveling?: boolean;
}

export function TravelModal({
  region,
  isOpen,
  onClose,
  onConfirm,
  traveling,
}: TravelModalProps) {
  if (!region || !isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-card border-2 border-border rounded-xl p-6 max-w-md w-full relative shadow-2xl"
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
            <h3 className="text-2xl font-bold text-text mb-2 flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Travel to {region.name}
            </h3>
            <p className="text-subtle">{region.description}</p>
          </div>

          {/* Buff Info */}
          <div className="mb-6">
            <RegionBuffBadge buffType={region.buffType} buffValue={region.buffValue} />
            <p className="text-sm text-subtle mt-2">
              Travel cost: 10 gold (simulated)
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={traveling}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={traveling}
              className="flex-1 bg-accent hover:bg-accent/90 text-white"
            >
              {traveling ? 'Traveling...' : 'Confirm Travel'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

