/**
 * Flow Store
 * Zustand store for challenge flow state container
 * v0.41.20 - C3 Step 21: State Migration Batch #4
 */
'use client';
import { createStore } from '../factory';
const initialState = {
    questions: [],
    currentIndex: 0,
    answers: new Map(),
    startTime: Date.now(),
    questionStartTime: Date.now(),
};
export const useFlowStore = createStore((set, get) => {
    const computeDerived = (state) => {
        const currentQuestion = state.questions[state.currentIndex] || null;
        const isComplete = state.currentIndex >= state.questions.length;
        const canGoBack = state.currentIndex > 0;
        const canGoNext = state.currentIndex < state.questions.length - 1;
        return {
            currentQuestion,
            isComplete,
            canGoBack,
            canGoNext,
        };
    };
    return {
        ...initialState,
        ...computeDerived(initialState),
        setQuestions: (questions) => {
            const newState = {
                questions,
                currentIndex: 0,
                answers: new Map(),
                startTime: Date.now(),
                questionStartTime: Date.now(),
            };
            set({ ...newState, ...computeDerived(newState) });
        },
        next: () => {
            const state = get();
            const newState = {
                ...state,
                currentIndex: Math.min(state.currentIndex + 1, state.questions.length),
                questionStartTime: Date.now(),
            };
            set({ ...newState, ...computeDerived(newState) });
        },
        back: () => {
            const state = get();
            const newState = {
                ...state,
                currentIndex: Math.max(state.currentIndex - 1, 0),
                questionStartTime: Date.now(),
            };
            set({ ...newState, ...computeDerived(newState) });
        },
        saveAnswer: (answer) => {
            const state = get();
            const timeMs = Date.now() - state.questionStartTime;
            const newAnswers = new Map(state.answers);
            newAnswers.set(answer.questionId, {
                ...answer,
                timeMs,
            });
            const newState = {
                ...state,
                answers: newAnswers,
            };
            set({ ...newState, ...computeDerived(newState) });
        },
        confirm: (optionId) => {
            const state = get();
            if (!state.currentQuestion)
                return;
            const timeMs = Date.now() - state.questionStartTime;
            const newAnswers = new Map(state.answers);
            newAnswers.set(state.currentQuestion.id, {
                questionId: state.currentQuestion.id,
                optionId,
                skipped: false,
                timeMs,
            });
            const newState = {
                ...state,
                answers: newAnswers,
                currentIndex: Math.min(state.currentIndex + 1, state.questions.length),
                questionStartTime: Date.now(),
            };
            set({ ...newState, ...computeDerived(newState) });
        },
        skip: () => {
            const state = get();
            if (!state.currentQuestion)
                return;
            const timeMs = Date.now() - state.questionStartTime;
            const newAnswers = new Map(state.answers);
            newAnswers.set(state.currentQuestion.id, {
                questionId: state.currentQuestion.id,
                skipped: true,
                timeMs,
            });
            const newState = {
                ...state,
                answers: newAnswers,
                currentIndex: Math.min(state.currentIndex + 1, state.questions.length),
                questionStartTime: Date.now(),
            };
            set({ ...newState, ...computeDerived(newState) });
        },
        stats: () => {
            const state = get();
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
        },
        getAnswer: (questionId) => {
            return get().answers.get(questionId);
        },
        reset: () => {
            set({ ...initialState, ...computeDerived(initialState) });
        },
    };
});
