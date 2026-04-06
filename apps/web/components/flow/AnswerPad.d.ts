interface AnswerOption {
    id: string;
    label: string;
    value: string;
}
interface AnswerPadProps {
    options: AnswerOption[];
    selectedId?: string;
    onSelect: (optionId: string) => void;
}
export declare function AnswerPad({ options, selectedId, onSelect }: AnswerPadProps): import("react").JSX.Element;
export {};
