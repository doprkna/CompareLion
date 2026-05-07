/**
 * Onboarding Step 2: Region
 * v0.24.0 - Phase I
 */

'use client';

import { motion } from 'framer-motion';
import { REGIONS, type RegionId, detectRegionFromBrowser } from '@parel/types/onboarding';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StepRegionProps {
  value?: RegionId;
  onSelect: (region: RegionId) => void;
  onBack: () => void;
}

export function StepRegion({ value, onSelect, onBack }: StepRegionProps) {
  const [detected, setDetected] = useState<RegionId | null>(null);

  useEffect(() => {
    // Auto-detect region
    const region = detectRegionFromBrowser();
    setDetected(region);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-2xl border border-border shadow-lg p-8 md:p-12"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-text mb-3">
          <MapPin className="inline-block mb-1" size={40} /> Where are you from?
        </h1>
        <p className="text-subtle text-lg">
          We'll tailor questions to your region
        </p>
        {detected && detected !== 'GLOBAL' && (
          <p className="text-sm text-accent mt-2">
            💡 Auto-detected: {REGIONS.find(r => r.id === detected)?.label}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 max-h-96 overflow-y-auto">
        {REGIONS.map((region) => (
          <button
            key={region.id}
            onClick={() => onSelect(region.id as RegionId)}
            className={`
              p-4 rounded-xl border-2 text-left transition-all
              hover:border-accent/60 hover:shadow-md
              ${value === region.id
                ? 'border-accent bg-accent/10 shadow-md'
                : detected === region.id
                ? 'border-accent/50 bg-accent/5'
                : 'border-border bg-card/80'
              }
            `}
          >
            <span className="text-2xl mr-3">{region.flag}</span>
            <span className="font-semibold text-text">
              {region.label.replace(region.flag, '').trim()}
            </span>
          </button>
        ))}
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-subtle hover:text-text transition"
      >
        <ArrowLeft size={16} />
        Back
      </button>
    </motion.div>
  );
}

