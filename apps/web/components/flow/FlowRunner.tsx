'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlow, type FlowQuestion } from '@/hooks/useFlow';
import { ProgressBar } from './ProgressBar';
import { AnswerPad } from './AnswerPad';
import { useXp } from '@/components/XpProvider';
import { logger } from '@/lib/logger';
import { useCombatLink } from '@/hooks/useCombatLink';

interface FlowRunnerProps {
  initialQuestions: FlowQuestion[];
  locale?: string;
}

export function FlowRunner({ initialQuestions, locale = 'en' }: FlowRunnerProps) {
  const router = useRouter();
  const { triggerXp } = useXp();
  const { attack: combatAttack, skip: combatSkip } = useCombatLink();
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const {
    questions,
    currentIndex,
    currentQuestion,
    isComplete,
    confirm,
    skip,
    back,
    canGoBack,
    stats,
    setQuestions,
  } = useFlow(initialQuestions);

  // Load questions if not provided initially
  useEffect(() => {
    if (initialQuestions.length === 0) {
      fetch(`/api/flow-questions?limit=5&locale=${locale}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.questions) {
            setQuestions(data.questions);
          }
        })
        .catch((err) => logger.error('Failed to fetch flow questions', err));
    }
  }, [initialQuestions.length, locale, setQuestions]);

  // Reset selection when question changes
  useEffect(() => {
    setSelectedOptionId(undefined);
  }, [currentIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSaving) return;
      
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (selectedOptionId) {
            handleConfirm();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSkip();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (canGoBack) {
            back();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOptionId, isSaving, canGoBack, handleConfirm, handleSkip, back]);

  // Show completion modal when done
  useEffect(() => {
    if (isComplete && questions.length > 0) {
      setShowCompletion(true);
    }
  }, [isComplete, questions.length]);

  // Handle confirm
  const handleConfirm = async () => {
    if (!selectedOptionId || !currentQuestion) return;

    setIsSaving(true);
    try {
      // Save to API
      const response = await fetch('/api/flow-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          optionId: selectedOptionId,
          skipped: false,
        }),
      });

      if (response.ok) {
        // Trigger XP animation with proper amount
        triggerXp(10, 'xp');
        
        // Trigger combat attack
        combatAttack();
        
        // Confirm in local state
        confirm(selectedOptionId);
      } else {
        logger.error('Failed to save answer');
      }
    } catch (error) {
      logger.error('Error saving answer', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle skip
  const handleSkip = async () => {
    if (!currentQuestion) return;

    setIsSaving(true);
    try {
      await fetch('/api/flow-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          skipped: true,
        }),
      });

      // Trigger enemy attack on skip
      combatSkip();

      skip();
    } catch (error) {
      logger.error('Error skipping question', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Completion modal
  if (showCompletion) {
    const flowStats = stats();
    
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card border-2 border-border rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-accent mb-6 text-center">
            Flow Complete! 🎉
          </h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-subtle">Questions Answered:</span>
              <span className="text-text font-bold text-xl">{flowStats.answered}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-subtle">Questions Skipped:</span>
              <span className="text-text font-bold text-xl">{flowStats.skipped}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-subtle">Total Time:</span>
              <span className="text-text font-bold text-xl">{Math.round(flowStats.totalTime / 1000)}s</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-subtle">Avg Time/Question:</span>
              <span className="text-text font-bold text-xl">{Math.round(flowStats.avgTimePerQuestion / 1000)}s</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition shadow-lg"
            >
              Start New Flow
            </button>
            <button
              onClick={() => router.push('/main')}
              className="w-full bg-card border-2 border-border text-text px-6 py-3 rounded-lg font-medium hover:border-accent transition"
            >
              Back to Main
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text">Loading questions...</div>
      </div>
    );
  }

  // Main flow UI
  return (
    <div className="min-h-screen bg-bg p-4 sm:p-6 flex flex-col">
      <div className="max-w-2xl mx-auto flex-1 flex flex-col">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProgressBar
            current={currentIndex + 1}
            total={questions.length}
            className="mb-6 sm:mb-8"
          />
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-card border-2 border-border rounded-2xl p-6 sm:p-8 shadow-2xl mb-6 flex-1 flex flex-col"
          >
            <motion.h2 
              className="text-xl sm:text-2xl font-bold text-text mb-6 sm:mb-8 leading-relaxed flex-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {currentQuestion.text}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <AnswerPad
                options={currentQuestion.options}
                selectedId={selectedOptionId}
                onSelect={setSelectedOptionId}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <motion.div 
          className="flex items-center gap-3 sm:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <button
            onClick={back}
            disabled={!canGoBack || isSaving}
            className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg bg-card border-2 border-border text-text font-medium hover:border-accent transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <button
            onClick={handleSkip}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg bg-card border-2 border-border text-subtle font-medium hover:border-accent transition disabled:opacity-40"
          >
            <SkipForward className="h-4 w-4" />
            <span className="hidden sm:inline">Skip</span>
          </button>

          <button
            onClick={handleConfirm}
            disabled={!selectedOptionId || isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg bg-accent text-white font-bold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
          >
            {isSaving ? 'Saving...' : 'Confirm'}
            {!isSaving && <ArrowRight className="h-4 w-4" />}
          </button>
        </motion.div>

        {/* Help text */}
        <motion.p 
          className="text-center text-subtle text-xs sm:text-sm mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Select an answer and click Confirm, or Skip to move on
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> • </span>
          <span className="sm:hidden">Use </span>
          <kbd className="hidden sm:inline bg-border px-2 py-1 rounded text-xs">Enter</kbd>
          <span className="sm:hidden">Enter</span>
          <span className="hidden sm:inline"> to confirm, </span>
          <span className="sm:hidden"> or </span>
          <kbd className="hidden sm:inline bg-border px-2 py-1 rounded text-xs">→</kbd>
          <span className="sm:hidden">→</span>
          <span className="hidden sm:inline"> to skip</span>
          <span className="sm:hidden"> to skip</span>
        </motion.p>
      </div>
    </div>
  );
}

