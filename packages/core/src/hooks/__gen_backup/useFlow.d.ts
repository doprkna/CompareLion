import type { FlowQuestion, FlowAnswer } from '../state/stores/flowStore';
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
