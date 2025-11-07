/**
 * Onboarding Flow - Main Container
 * v0.24.0 - Phase I: Smart Onboarding
 * 
 * Multi-step onboarding with fun emoji-based UI
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { StepAge } from './StepAge';
import { StepRegion } from './StepRegion';
import { StepInterests } from './StepInterests';
import { StepTone } from './StepTone';
import { StepFinish } from './StepFinish';
import type { OnboardingData } from '@/lib/types/onboarding';

interface OnboardingFlowProps {
  initialData?: OnboardingData;
  onComplete?: () => void;
}

export default function OnboardingFlow({ initialData, onComplete }: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData || {});
  const [submitting, setSubmitting] = useState(false);

  const totalSteps = 5;

  // Update data for current step
  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  // Move to next step
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  // Move to previous step
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Skip onboarding
  const skip = async () => {
    // Save minimal data
    try {
      await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ageGroup: 'adult',
          region: 'GLOBAL',
          interests: [],
          tone: 'random',
        }),
      });
      
      if (onComplete) onComplete();
      else router.push('/daily');
    } catch (error) {
      console.error('Skip failed:', error);
    }
  };

  // Submit onboarding
  const submit = async () => {
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit onboarding');
      }

      // Save to localStorage as well
      localStorage.setItem('onboardingCompleted', 'true');
      
      if (onComplete) onComplete();
      else router.push('/daily');
    } catch (error) {
      console.error('Submit failed:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Progress bar
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      {/* Skip button */}
      <button
        onClick={skip}
        className="absolute top-4 right-4 text-sm text-gray-500 hover:text-gray-700 transition"
      >
        Too cool for setup? Skip → chaos mode
      </button>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Step container */}
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepAge
              key="step-age"
              value={data.ageGroup}
              onSelect={(ageGroup) => {
                updateData({ ageGroup });
                nextStep();
              }}
              onBack={prevStep}
            />
          )}

          {step === 2 && (
            <StepRegion
              key="step-region"
              value={data.region}
              onSelect={(region) => {
                updateData({ region });
                nextStep();
              }}
              onBack={prevStep}
            />
          )}

          {step === 3 && (
            <StepInterests
              key="step-interests"
              value={data.interests || []}
              onSelect={(interests) => {
                updateData({ interests });
                nextStep();
              }}
              onBack={prevStep}
            />
          )}

          {step === 4 && (
            <StepTone
              key="step-tone"
              value={data.tone}
              onSelect={(tone) => {
                updateData({ tone });
                nextStep();
              }}
              onBack={prevStep}
            />
          )}

          {step === 5 && (
            <StepFinish
              key="step-finish"
              data={data}
              onSubmit={submit}
              onBack={prevStep}
              submitting={submitting}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

