/**
 * useFlow Hook
 * v0.41.20 - Migrated to unified state store
 */
import type { FlowQuestion, FlowAnswer } from '../state/stores/flowStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
export type { FlowQuestion, FlowAnswer };
export declare function useFlow(initialQuestions?: FlowQuestion[]): {
    questions: any;
    currentIndex: any;
    currentQuestion: any;
    answers: any;
    isComplete: any;
    setQuestions: any;
    next: any;
    back: any;
    confirm: any;
    skip: any;
    saveAnswer: any;
    stats: any;
    getAnswer: any;
    canGoBack: any;
    canGoNext: any;
};
