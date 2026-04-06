export interface FlowQuestionOption {
  id: string;
  label: string;
  value: string;
  order?: number;
}
export interface FlowQuestion {
  id: string;
  text: string;
  type: string;
  options?: FlowQuestionOption[];
  categoryName?: string;
  challengeEnabled?: boolean;
}
export type AnswerValue =
  | { kind: 'text'; text: string }
  | { kind: 'single'; optionId: string }
  | { kind: 'multi'; optionIds: string[] }
  | { kind: 'number'; value: number | null };

export declare function normalizeFlowQuestionType(raw: string | undefined): string;

interface QuestionInputProps {
  question: FlowQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  onSelectForSubmit?: (value: AnswerValue) => void;
  disabled?: boolean;
}
export declare function QuestionInput(props: QuestionInputProps): import('react').JSX.Element;
export declare function isValidAnswer(question: FlowQuestion, value: AnswerValue): boolean;
export declare function toApiPayload(question: FlowQuestion, value: AnswerValue): Record<string, unknown>;
export declare function getInitialValue(question: FlowQuestion): AnswerValue;
