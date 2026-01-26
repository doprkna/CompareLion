'use client';
// sanity-fix
/**
 * useFlow Hook
 * v0.41.20 - Migrated to unified state store
 */

'use client';

import { useEffect } from 'react';
import { useFlowStore } from '../state/stores/flowStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
import type { FlowQuestion, FlowAnswer } from '../state/stores/flowStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import

export type { FlowQuestion, FlowAnswer };

export function useFlow(initialQuestions: FlowQuestion[] = []) {
  const store = useFlowStore();

  // Initialize with initial questions if provided
  useEffect(() => {
    if (initialQuestions.length > 0 && store.questions.length === 0) {
      store.setQuestions(initialQuestions);
    }
  }, [initialQuestions, store]);

  return {
    // State
    questions: store.questions,
    currentIndex: store.currentIndex,
    currentQuestion: store.currentQuestion,
    answers: store.answers,
    isComplete: store.isComplete,
    
    // Actions
    setQuestions: store.setQuestions,
    next: store.next,
    back: store.back,
    confirm: store.confirm,
    skip: store.skip,
    saveAnswer: store.saveAnswer,
    
    // Utilities
    stats: store.stats,
    getAnswer: store.getAnswer,
    canGoBack: store.canGoBack,
    canGoNext: store.canGoNext,
  };
}












