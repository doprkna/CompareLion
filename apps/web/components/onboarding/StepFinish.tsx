/**
 * Onboarding Step 5: Finish & Summary
 * v0.24.0 - Phase I
 */

'use client';

import { motion } from 'framer-motion';
import { 
  getAgeGroup, 
  getRegion, 
  getTone, 
  getInterests, 
  type OnboardingData 
} from '@parel/types/onboarding';
import { ArrowLeft, PartyPopper, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface StepFinishProps {
  data: OnboardingData;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}

export function StepFinish({ data, onSubmit, onBack, submitting }: StepFinishProps) {
  const ageGroup = getAgeGroup(data.ageGroup);
  const region = getRegion(data.region);
  const tone = getTone(data.tone);
  const interests = getInterests(data.interests);

  useEffect(() => {
    // Trigger confetti on mount
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center"
    >
      {/* Icon */}
      <div className="mb-6">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: 2 }}
        >
          <PartyPopper size={64} className="mx-auto text-purple-600" />
        </motion.div>
      </div>

      {/* Header */}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
        Welcome to the chaos!
      </h1>

      {/* Summary */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-8 text-left">
        <p className="text-lg text-gray-700 mb-4">
          So you're a{' '}
          <strong className="text-purple-700">
            {ageGroup?.shortLabel || 'Mystery Person'}
          </strong>
          {' '}from{' '}
          <strong className="text-purple-700">
            {region?.label.replace(region.flag, '').trim() || 'Somewhere'}
          </strong>
          {interests.length > 0 && (
            <>
              , into{' '}
              <strong className="text-purple-700">
                {interests.map(i => i.label).join(', ')}
              </strong>
            </>
          )}
          {', '}
          who likes it{' '}
          <strong className="text-purple-700">
            {tone?.id || 'random'}
          </strong>
          .
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Sparkles size={16} className="text-purple-500" />
          <span>Let's compare your life choices!</span>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onSubmit}
        disabled={submitting}
        className={`
          w-full py-4 rounded-xl text-white font-semibold text-lg
          transition-all shadow-lg
          ${submitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:scale-105'
          }
        `}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            Saving your vibe...
          </span>
        ) : (
          '🚀 Start Comparing!'
        )}
      </button>

      {/* Back button */}
      <button
        onClick={onBack}
        disabled={submitting}
        className="mt-4 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition mx-auto"
      >
        <ArrowLeft size={16} />
        Back
      </button>
    </motion.div>
  );
}

