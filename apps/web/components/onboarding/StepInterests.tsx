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
      className="bg-white rounded-2xl shadow-2xl p-8 md:p-12"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
          <Sparkles className="inline-block mb-1" size={40} /> What are you into?
        </h1>
        <p className="text-gray-600 text-lg">
          Pick as many as you like (or none, we don't judge)
        </p>
        <p className="text-sm text-purple-600 mt-2">
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
                hover:border-purple-500 hover:shadow-lg hover:scale-105
                ${isSelected
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-200 bg-white'
                }
              `}
            >
              <div className="text-3xl mb-1">{interest.emoji}</div>
              <div className="text-sm font-semibold text-gray-900">
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
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <button
          onClick={proceed}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
        >
          Next
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}

