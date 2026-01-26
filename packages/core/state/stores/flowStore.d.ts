/**
 * Flow Store
 * Zustand store for challenge flow state container
 * v0.41.20 - C3 Step 21: State Migration Batch #4
 */
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
export declare const useFlowStore: UseBoundStore<StoreApi<T>>;
