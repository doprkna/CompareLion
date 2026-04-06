interface CommentFormProps {
    onSubmit: (content: string) => void | Promise<void>;
    onCancel?: () => void;
    placeholder?: string;
    maxLength?: number;
}
export declare function CommentForm({ onSubmit, onCancel, placeholder, maxLength, }: CommentFormProps): import("react").JSX.Element;
export {};
