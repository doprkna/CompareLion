/**
 * Onboarding Step 4: Tone Preference
 * v0.24.0 - Phase I
 */

'use client';

import { motion } from 'framer-motion';
import { TONE_OPTIONS, type ToneId } from '@parel/types/onboarding';
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
      className="bg-card rounded-2xl border border-border shadow-lg p-8 md:p-12"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-text mb-3">
          🎭 What's your vibe?
        </h1>
        <p className="text-subtle text-lg">
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
              hover:border-accent/60 hover:shadow-md
              ${value === tone.id
                ? 'border-accent bg-accent/10 shadow-md'
                : 'border-border bg-card/80'
              }
            `}
          >
            <div className="text-4xl mb-3">{tone.emoji}</div>
            <div className="font-semibold text-text mb-2 text-lg">
              {tone.label}
            </div>
            <div className="text-sm text-subtle">
              {tone.desc}
            </div>
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

