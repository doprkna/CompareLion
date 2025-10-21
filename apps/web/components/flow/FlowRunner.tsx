'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { useFlow, type FlowQuestion } from '@/hooks/useFlow';
import { ProgressBar } from './ProgressBar';
import { AnswerPad } from './AnswerPad';
import { useXp } from '@/components/XpProvider';

interface FlowRunnerProps {
  initialQuestions: FlowQuestion[];
  locale?: string;
}

export function FlowRunner({ initialQuestions, locale = 'en' }: FlowRunnerProps) {
  const router = useRouter();
  const { triggerXp } = useXp();
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
        .catch(console.error);
    }
  }, [initialQuestions.length, locale, setQuestions]);

  // Reset selection when question changes
  useEffect(() => {
    setSelectedOptionId(undefined);
  }, [currentIndex]);

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
        // Trigger XP animation
        triggerXp(1, 'xp');
        
        // Confirm in local state
        confirm(selectedOptionId);
      } else {
        console.error('Failed to save answer');
      }
    } catch (error) {
      console.error('Error saving answer:', error);
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

      skip();
    } catch (error) {
      console.error('Error skipping question:', error);
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
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <ProgressBar
          current={currentIndex + 1}
          total={questions.length}
          className="mb-8"
        />

        {/* Question Card */}
        <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-2xl mb-6">
          <h2 className="text-2xl font-bold text-text mb-8 leading-relaxed">
            {currentQuestion.text}
          </h2>

          <AnswerPad
            options={currentQuestion.options}
            selectedId={selectedOptionId}
            onSelect={setSelectedOptionId}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={back}
            disabled={!canGoBack || isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-card border-2 border-border text-text font-medium hover:border-accent transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            onClick={handleSkip}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-card border-2 border-border text-subtle font-medium hover:border-accent transition disabled:opacity-40"
          >
            <SkipForward className="h-4 w-4" />
            Skip
          </button>

          <button
            onClick={handleConfirm}
            disabled={!selectedOptionId || isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent text-white font-bold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
          >
            {isSaving ? 'Saving...' : 'Confirm'}
            {!isSaving && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Help text */}
        <p className="text-center text-subtle text-sm mt-4">
          Select an answer and click Confirm, or Skip to move on
        </p>
      </div>
    </div>
  );
}

