/**
 * Onboarding Step 3: Interests
 * v0.24.0 - Phase I
 */

'use client';

import { motion } from 'framer-motion';
import { INTERESTS, type InterestId } from '@parel/types/onboarding';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface StepInterestsProps {
  value: InterestId[];
  onSelect: (interests: InterestId[]) => void;
  onBack: () => void;
}

export function StepInterests({ value, onSelect, onBack }: StepInterestsProps) {
  const [selected, setSelected] = useState<InterestId[]>(value);

  const toggle = (id: InterestId) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const proceed = () => {
    onSelect(selected);
  };

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
          <Sparkles className="inline-block mb-1" size={40} /> What are you into?
        </h1>
        <p className="text-subtle text-lg">
          Pick as many as you like (or none, we don't judge)
        </p>
        <p className="text-sm text-accent mt-2">
          {selected.length} selected
        </p>
      </div>

      {/* Options - Multi-select chips */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {INTERESTS.map((interest) => {
          const isSelected = selected.includes(interest.id as InterestId);
          return (
            <button
              key={interest.id}
              onClick={() => toggle(interest.id as InterestId)}
              className={`
                p-4 rounded-xl border-2 text-center transition-all
                hover:border-accent/60 hover:shadow-md
                ${isSelected
                  ? 'border-accent bg-accent/10 shadow-md'
                  : 'border-border bg-card/80'
                }
              `}
            >
              <div className="text-3xl mb-1">{interest.emoji}</div>
              <div className="text-sm font-semibold text-text">
                {interest.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-subtle hover:text-text transition"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <button
          onClick={proceed}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent/90 transition"
        >
          Next
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}

