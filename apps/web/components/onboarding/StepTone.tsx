/**
 * Onboarding Step 4: Tone Preference
 * v0.24.0 - Phase I
 */

'use client';

import { motion } from 'framer-motion';
import { TONE_OPTIONS, type ToneId } from '@/lib/types/onboarding';
import { ArrowLeft } from 'lucide-react';

interface StepToneProps {
  value?: ToneId;
  onSelect: (tone: ToneId) => void;
  onBack: () => void;
}

export function StepTone({ value, onSelect, onBack }: StepToneProps) {
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
          🎭 What's your vibe?
        </h1>
        <p className="text-gray-600 text-lg">
          How should we talk to you?
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {TONE_OPTIONS.map((tone) => (
          <button
            key={tone.id}
            onClick={() => onSelect(tone.id as ToneId)}
            className={`
              p-6 rounded-xl border-2 text-left transition-all
              hover:border-purple-500 hover:shadow-lg hover:scale-105
              ${value === tone.id
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-gray-200 bg-white'
              }
            `}
          >
            <div className="text-4xl mb-3">{tone.emoji}</div>
            <div className="font-semibold text-gray-900 mb-2 text-lg">
              {tone.label}
            </div>
            <div className="text-sm text-gray-600">
              {tone.desc}
            </div>
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

