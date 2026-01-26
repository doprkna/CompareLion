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
      className="bg-white rounded-2xl shadow-2xl p-8 md:p-12"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
          <MapPin className="inline-block mb-1" size={40} /> Where are you from?
        </h1>
        <p className="text-gray-600 text-lg">
          We'll tailor questions to your region
        </p>
        {detected && detected !== 'GLOBAL' && (
          <p className="text-sm text-purple-600 mt-2">
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
              hover:border-purple-500 hover:shadow-lg hover:scale-105
              ${value === region.id
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : detected === region.id
                ? 'border-purple-300 bg-purple-50/50'
                : 'border-gray-200 bg-white'
              }
            `}
          >
            <span className="text-2xl mr-3">{region.flag}</span>
            <span className="font-semibold text-gray-900">
              {region.label.replace(region.flag, '').trim()}
            </span>
          </button>
        ))}
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition"
      >
        <ArrowLeft size={16} />
        Back
      </button>
    </motion.div>
  );
}

