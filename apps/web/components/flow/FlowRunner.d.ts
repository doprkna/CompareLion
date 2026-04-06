import { type FlowQuestion } from '@parel/core/hooks/useFlow';
interface FlowRunnerProps {
    initialQuestions: FlowQuestion[];
    locale?: string;
}
export declare function FlowRunner({ initialQuestions, locale }: FlowRunnerProps): import("react").JSX.Element;
export {};
