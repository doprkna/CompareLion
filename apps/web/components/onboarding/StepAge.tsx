/**
 * Onboarding Step 1: Age Group
 * v0.24.0 - Phase I
 */

'use client';

import { motion } from 'framer-motion';
import { AGE_GROUPS, type AgeGroupId } from '@parel/types/onboarding';
import { ArrowLeft } from 'lucide-react';

interface StepAgeProps {
  value?: AgeGroupId;
  onSelect: (ageGroup: AgeGroupId) => void;
  onBack?: () => void;
}

export function StepAge({ value, onSelect, onBack }: StepAgeProps) {
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
          🎂 How old are you?
        </h1>
        <p className="text-gray-600 text-lg">
          Pick your life stage (no judgment zone)
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {AGE_GROUPS.map((group) => (
          <button
            key={group.id}
            onClick={() => onSelect(group.id as AgeGroupId)}
            className={`
              p-6 rounded-xl border-2 text-left transition-all
              hover:border-purple-500 hover:shadow-lg hover:scale-105
              ${value === group.id
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-gray-200 bg-white'
              }
            `}
          >
            <div className="text-3xl mb-2">{group.emoji}</div>
            <div className="font-semibold text-gray-900 mb-1">
              {group.shortLabel}
            </div>
            <div className="text-sm text-gray-600">
              {group.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Back button (if provided) */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      )}
    </motion.div>
  );
}

