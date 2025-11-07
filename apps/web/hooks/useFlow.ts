'use client';

import { useState, useCallback } from 'react';

export interface FlowQuestion {
  id: string;
  text: string;
  type: string;
  locale: string;
  options: Array<{
    id: string;
    label: string;
    value: string;
    order: number;
  }>;
}

export interface FlowAnswer {
  questionId: string;
  optionId?: string;
  valueText?: string;
  skipped: boolean;
  timeMs?: number;
}

export interface FlowState {
  questions: FlowQuestion[];
  currentIndex: number;
  answers: Map<string, FlowAnswer>;
  startTime: number;
  questionStartTime: number;
}

export function useFlow(initialQuestions: FlowQuestion[] = []) {
  const [state, setState] = useState<FlowState>({
    questions: initialQuestions,
    currentIndex: 0,
    answers: new Map(),
    startTime: Date.now(),
    questionStartTime: Date.now(),
  });

  // Set questions (for async loading)
  const setQuestions = useCallback((questions: FlowQuestion[]) => {
    setState(prev => ({
      ...prev,
      questions,
      startTime: Date.now(),
      questionStartTime: Date.now(),
    }));
  }, []);

  // Get current question
  const currentQuestion = state.questions[state.currentIndex] || null;

  // Check if we're at the end
  const isComplete = state.currentIndex >= state.questions.length;

  // Move to next question
  const next = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, prev.questions.length),
      questionStartTime: Date.now(),
    }));
  }, []);

  // Move to previous question
  const back = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0),
      questionStartTime: Date.now(),
    }));
  }, []);

  // Save answer
  const saveAnswer = useCallback((answer: Omit<FlowAnswer, 'timeMs'>) => {
    const timeMs = Date.now() - state.questionStartTime;
    
    setState(prev => {
      const newAnswers = new Map(prev.answers);
      newAnswers.set(answer.questionId, {
        ...answer,
        timeMs,
      });
      
      return {
        ...prev,
        answers: newAnswers,
      };
    });
  }, [state.questionStartTime]);

  // Confirm answer and move to next
  const confirm = useCallback((optionId: string) => {
    if (!currentQuestion) return;
    
    saveAnswer({
      questionId: currentQuestion.id,
      optionId,
      skipped: false,
    });
    
    next();
  }, [currentQuestion, saveAnswer, next]);

  // Skip question and move to next
  const skip = useCallback(() => {
    if (!currentQuestion) return;
    
    saveAnswer({
      questionId: currentQuestion.id,
      skipped: true,
    });
    
    next();
  }, [currentQuestion, saveAnswer, next]);

  // Get stats
  const stats = useCallback(() => {
    const answered = Array.from(state.answers.values()).filter(a => !a.skipped).length;
    const skipped = Array.from(state.answers.values()).filter(a => a.skipped).length;
    const totalTime = Date.now() - state.startTime;
    const avgTimePerQuestion = state.answers.size > 0 
      ? Array.from(state.answers.values()).reduce((sum, a) => sum + (a.timeMs || 0), 0) / state.answers.size
      : 0;

    return {
      answered,
      skipped,
      totalTime,
      avgTimePerQuestion: Math.round(avgTimePerQuestion),
      total: state.questions.length,
    };
  }, [state]);

  // Get answer for a specific question
  const getAnswer = useCallback((questionId: string) => {
    return state.answers.get(questionId);
  }, [state.answers]);

  return {
    // State
    questions: state.questions,
    currentIndex: state.currentIndex,
    currentQuestion,
    answers: state.answers,
    isComplete,
    
    // Actions
    setQuestions,
    next,
    back,
    confirm,
    skip,
    saveAnswer,
    
    // Utilities
    stats,
    getAnswer,
    canGoBack: state.currentIndex > 0,
    canGoNext: state.currentIndex < state.questions.length - 1,
  };
}













