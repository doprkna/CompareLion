interface QuestionCardProps {
    question: any;
    questionIndex: number;
    answers: any[];
    onAnswer: (index: number, answer: any) => void;
}
export declare function SynchQuestionCard({ question, questionIndex, answers, onAnswer }: QuestionCardProps): import("react").JSX.Element | null;
export {};
